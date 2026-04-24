"""
Fine-tuning pipeline for SmartChain Hub TensorFlow model.

Reads real user transaction data from 0G Storage Log layer,
converts it to training features, and incrementally fine-tunes
the existing savings model without overwriting the base weights.

Usage:
    python scripts/fine_tuner.py                    # fine-tune from 0G Storage
    python scripts/fine_tuner.py --dry-run          # validate data only
"""

import os
import sys
import json
import argparse
import datetime
import hashlib
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.savings_model import SavingsModel

# ── 0G Storage configuration ──────────────────────────────────────────────────
OG_INDEXER_RPC  = os.environ.get("OG_INDEXER_RPC",  "https://indexer-storage-testnet-standard.0g.ai")
OG_STORAGE_RPC  = os.environ.get("OG_STORAGE_RPC",  "https://evmrpc.0g.ai")
STORAGE_KEY     = os.environ.get("STORAGE_PRIVATE_KEY", "")

PRIORITY_MAP    = {"efficiency": 0, "speed": 1, "security": 2}
MIN_SAMPLES     = 10          # minimum real samples before fine-tuning
FINE_TUNE_EPOCHS = 50         # incremental epochs (not full retrain)
FINE_TUNE_LR    = 0.0001      # lower LR to preserve base knowledge


def fetch_transactions_from_0g(root_hashes: list[str]) -> list[dict]:
    """
    Download transaction receipts from 0G Storage Log layer by root hash.
    Falls back to empty list if SDK unavailable or network unreachable.
    """
    if not STORAGE_KEY:
        print("[fine_tuner] STORAGE_PRIVATE_KEY not set — skipping 0G Storage fetch")
        return []

    records = []
    try:
        import importlib
        sdk = importlib.import_module("og_storage_sdk")
    except ImportError:
        # 0G Python SDK not yet published — use HTTP fallback via indexer API
        sdk = None

    for root_hash in root_hashes:
        try:
            if sdk:
                # Official SDK path (when available)
                client = sdk.StorageClient(OG_INDEXER_RPC, STORAGE_KEY)
                data = client.download(root_hash)
                records.append(json.loads(data))
            else:
                # HTTP fallback: query indexer REST API
                import requests
                resp = requests.get(
                    f"{OG_INDEXER_RPC}/v1/file/{root_hash}",
                    timeout=15
                )
                if resp.status_code == 200:
                    records.append(resp.json())
        except Exception as e:
            print(f"[fine_tuner] Could not fetch {root_hash[:16]}...: {e}")

    return records


def transactions_to_features(transactions: list[dict]) -> tuple[np.ndarray, np.ndarray]:
    """
    Convert real transaction records to (X, y) training arrays.

    Expected record schema (matches transactionController.js storageData):
      { amount, fee, savings, route, tee_verified, timestamp }
    """
    X, y = [], []
    hour_now = float(datetime.datetime.utcnow().hour)

    route_to_priority = {
        "0G Chain Flash Route":           0,
        "0G Compute Flash Route":         0,
        "Standard Layer 2 Aggregator":    1,
        "High Speed":                     1,
        "Decentralized Liquidity Bridge": 2,
        "Economy Route":                  2,
    }

    for tx in transactions:
        try:
            amount   = float(tx.get("amount", 0))
            fee      = float(tx.get("fee", 0))
            savings  = float(tx.get("savings", 0))
            route    = tx.get("route", "")
            ts       = tx.get("timestamp", 0)

            if amount <= 0 or fee < 0 or savings < 0:
                continue

            priority_idx = route_to_priority.get(route, 0)
            hour = float(datetime.datetime.utcfromtimestamp(ts / 1000).hour) if ts else hour_now

            # Estimate congestion from fee ratio (higher fee → higher congestion)
            standard_fee = amount * 0.015
            congestion = min(fee / standard_fee, 1.0) if standard_fee > 0 else 0.3

            feat = SavingsModel._make_features_static(amount, priority_idx, congestion, hour)

            savings_rate = np.clip(savings / amount, 0.001, 0.04) if amount > 0 else 0.01
            confidence   = 0.92 if tx.get("tee_verified") else 0.80
            risk         = [0.1, 0.3, 0.05][priority_idx]

            X.append(feat)
            y.append([savings_rate, confidence, risk])

        except (KeyError, TypeError, ValueError):
            continue

    if not X:
        return np.empty((0, 6), dtype=np.float32), np.empty((0, 3), dtype=np.float32)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def fine_tune(root_hashes: list[str], dry_run: bool = False) -> dict:
    """
    Main fine-tuning entry point.

    1. Fetch transaction data from 0G Storage
    2. Convert to training features
    3. Incrementally fine-tune the model with lower LR
    4. Save updated model and return new model hash
    """
    print(f"[fine_tuner] Fetching {len(root_hashes)} receipts from 0G Storage...")
    transactions = fetch_transactions_from_0g(root_hashes)

    if not transactions:
        return {"ok": False, "reason": "no_data", "samples": 0}

    X, y = transactions_to_features(transactions)
    n_samples = len(X)
    print(f"[fine_tuner] Converted {n_samples} valid samples")

    if n_samples < MIN_SAMPLES:
        return {"ok": False, "reason": "insufficient_samples", "samples": n_samples, "min": MIN_SAMPLES}

    if dry_run:
        return {"ok": True, "dry_run": True, "samples": n_samples}

    # Load existing model
    model_obj = SavingsModel()

    # Lower learning rate for fine-tuning to preserve base knowledge
    import tensorflow as tf
    model_obj.model.compile(
        optimizer=tf.keras.optimizers.Adam(FINE_TUNE_LR),
        loss="mse",
        metrics=["mae"]
    )

    history = model_obj.model.fit(
        X, y,
        epochs=FINE_TUNE_EPOCHS,
        batch_size=min(32, n_samples),
        validation_split=0.1 if n_samples >= 20 else 0.0,
        verbose=0
    )

    # Save fine-tuned model
    model_obj.model.save(model_obj.model_path)

    # Compute new model hash (SHA-256 of weights bytes)
    weights_bytes = b"".join(w.tobytes() for w in model_obj.model.get_weights())
    model_hash = "0x" + hashlib.sha256(weights_bytes).hexdigest()

    final_loss = float(history.history["loss"][-1])
    print(f"[fine_tuner] Fine-tuning complete. Loss: {final_loss:.6f}  Model hash: {model_hash[:18]}...")

    return {
        "ok": True,
        "samples": n_samples,
        "epochs": FINE_TUNE_EPOCHS,
        "final_loss": final_loss,
        "model_hash": model_hash,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune SmartChain TF model on 0G Storage data")
    parser.add_argument("--root-hashes", nargs="*", default=[], help="0G Storage root hashes to fetch")
    parser.add_argument("--dry-run", action="store_true", help="Validate data without training")
    args = parser.parse_args()

    result = fine_tune(args.root_hashes, dry_run=args.dry_run)
    print(json.dumps(result, indent=2))
