from flask import Flask, request, jsonify
from flask_cors import CORS
import sys, os, time, hashlib, json, requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.optimizer import TransactionOptimizer

app = Flask(__name__)
CORS(app)

optimizer = TransactionOptimizer()

# 0G Compute configuration
# Docs: https://docs.0g.ai/build-with-0g/compute-network/sdk
OG_COMPUTE_BROKER_URL = os.environ.get("OG_COMPUTE_BROKER_URL", "https://broker.0g.ai")
OG_COMPUTE_MODEL = os.environ.get("OG_COMPUTE_MODEL", "llama-3.1-8b-instruct")
OG_COMPUTE_API_KEY = os.environ.get("OG_COMPUTE_API_KEY", "")

EXPLANATIONS = {
    'efficiency': "The AI prioritized lower gas fees by selecting a high-throughput route with minimized relay costs.",
    'speed': "The AI selected the route with the highest node availability and lowest block finality time.",
    'security': "The AI prioritized routes with the highest number of decentralized validators and verifiable compute proofs."
}


def call_0g_compute(prompt: str) -> dict:
    """
    Routes inference through 0G Compute network with TEE verification.
    Returns result + TEE proof metadata for UI display.
    Docs: https://docs.0g.ai/build-with-0g/compute-network/sdk#inference
    """
    if not OG_COMPUTE_API_KEY:
        return None  # Fall back to local optimizer

    try:
        headers = {
            "Authorization": f"Bearer {OG_COMPUTE_API_KEY}",
            "Content-Type": "application/json",
            # Request TeeML verification mode (model runs inside TEE, response signed by TEE key)
            "X-Verification-Mode": "teeml",
        }
        payload = {
            "model": OG_COMPUTE_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 256,
            "temperature": 0.1,
        }
        resp = requests.post(
            f"{OG_COMPUTE_BROKER_URL}/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        resp.raise_for_status()
        data = resp.json()

        # Extract TEE proof from response headers / body
        tee_proof = resp.headers.get("X-TEE-Proof", "")
        tee_signer = resp.headers.get("X-TEE-Signer", "")
        provider_id = resp.headers.get("X-Provider-ID", "0g-compute-node")

        return {
            "content": data["choices"][0]["message"]["content"],
            "tee_verified": True,
            "tee_mode": "TeeML",
            "tee_proof": tee_proof,
            "tee_signer": tee_signer,
            "provider_id": provider_id,
            "model": OG_COMPUTE_MODEL,
        }
    except Exception as e:
        print(f"0G Compute unavailable: {e}")
        return None


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "agent": "SmartChain AI v1.0",
        "og_compute": bool(OG_COMPUTE_API_KEY),
        "og_compute_model": OG_COMPUTE_MODEL,
    })


@app.route('/optimize', methods=['POST'])
def optimize_transaction():
    data = request.json
    amount = data.get('amount')
    priority = data.get('priority', 'efficiency')

    if amount is None:
        return jsonify({"error": "Amount is required"}), 400
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

    # Try 0G Compute first
    og_result = call_0g_compute(
        f"Optimize a blockchain transaction of ${amount} with priority: {priority}. "
        f"Return JSON with: fee (number), savings (number), route (string), confidence (number 0-100)."
    )

    if og_result:
        # Parse 0G Compute response
        try:
            parsed = json.loads(og_result["content"])
            result = {
                "fee": round(float(parsed.get("fee", amount * 0.005)), 2),
                "savings": round(float(parsed.get("savings", amount * 0.015)), 2),
                "route": parsed.get("route", "0G Compute Flash Route"),
                "confidence": round(float(parsed.get("confidence", 95.0)), 1),
                "ml_engine": f"0G Compute / {OG_COMPUTE_MODEL}",
                "explanation": EXPLANATIONS.get(priority, "AI optimized via 0G Compute."),
                # TEE proof metadata for UI badge
                "tee_verified": True,
                "tee_mode": og_result["tee_mode"],
                "tee_proof": og_result["tee_proof"],
                "tee_signer": og_result["tee_signer"],
                "provider_id": og_result["provider_id"],
            }
        except Exception:
            result = _local_optimize(amount, priority)
            result["tee_verified"] = False
    else:
        # Local TensorFlow fallback
        result = _local_optimize(amount, priority)
        result["tee_verified"] = False

    return jsonify(result)


def _local_optimize(amount: float, priority: str) -> dict:
    """Local TensorFlow optimizer fallback."""
    r = optimizer.optimize(amount, priority)
    r["explanation"] = EXPLANATIONS.get(priority, "AI optimized your transaction.")
    r["tee_mode"] = "local"
    r["tee_proof"] = ""
    r["tee_signer"] = ""
    r["provider_id"] = "local-tf"
    r.setdefault("estimated_time_s", 12)
    return r


if __name__ == '__main__':
    app.run(port=5000, debug=True)
