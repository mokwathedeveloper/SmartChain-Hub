"""
train_model.py
Trains the SmartChain optimizer model from a CSV file.

Works with:
  1. Generated synthetic data:  python3 scripts/generate_training_data.py
  2. Real Etherscan export:      download from https://etherscan.io/exportData
  3. Real 0G Chain data:         export from https://chainscan.0g.ai

CSV must have columns:
  amount, priority (0/1/2), congestion (0-1), hour (0-23),
  savings_rate, confidence, risk_score

Usage:
    python3 scripts/train_model.py
    python3 scripts/train_model.py --csv data/my_real_data.csv
"""
import sys
import os
import argparse
import numpy as np
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', default=os.path.join(os.path.dirname(__file__), '..', 'data', 'training_data.csv'))
    parser.add_argument('--epochs', type=int, default=300)
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV not found: {args.csv}")
        print("Run: python3 scripts/generate_training_data.py")
        sys.exit(1)

    df = pd.read_csv(args.csv)
    print(f"Loaded {len(df)} samples from {args.csv}")

    # ── Build features ──
    AMOUNT_LOG_MAX = np.log1p(100_000)
    amount_norm = np.log1p(df['amount'].values) / AMOUNT_LOG_MAX
    pri = df['priority'].values.astype(int)
    one_hot = np.eye(3)[pri]  # shape (N, 3)
    congestion = df['congestion'].values
    hour_norm = df['hour'].values / 24.0

    X = np.column_stack([amount_norm, one_hot, congestion, hour_norm]).astype(np.float32)
    y = df[['savings_rate', 'confidence', 'risk_score']].values.astype(np.float32)

    print(f"X shape: {X.shape}, y shape: {y.shape}")

    # ── Train ──
    import tensorflow as tf
    from tensorflow.keras import layers

    model = tf.keras.Sequential([
        layers.Input(shape=(6,)),
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.1),
        layers.Dense(32, activation='relu'),
        layers.Dense(16, activation='relu'),
        layers.Dense(3, activation='sigmoid'),
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(0.001), loss='mse', metrics=['mae'])

    history = model.fit(
        X, y,
        epochs=args.epochs,
        batch_size=64,
        validation_split=0.15,
        verbose=1,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=20, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(patience=10, factor=0.5, verbose=1),
        ]
    )

    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tf_savings_model.keras')
    model.save(model_path)
    final_loss = history.history['val_loss'][-1]
    print(f"\nSaved to {model_path}")
    print(f"Final val_loss: {final_loss:.6f}")

    # Quick sanity check
    test_cases = [(100, 0, 0.3, 12), (1000, 0, 0.7, 14), (5000, 1, 0.5, 9), (500, 2, 0.2, 3)]
    print("\nSanity check:")
    for amt, pri, cong, hr in test_cases:
        feat = np.array([[np.log1p(amt)/AMOUNT_LOG_MAX, *np.eye(3)[pri], cong, hr/24]], dtype=np.float32)
        out = model.predict(feat, verbose=0)[0]
        print(f"  amt={amt:6} pri={['eff','spd','sec'][pri]} cong={cong} → savings={out[0]:.4f} conf={out[1]:.3f} risk={out[2]:.3f}")

if __name__ == '__main__':
    main()
