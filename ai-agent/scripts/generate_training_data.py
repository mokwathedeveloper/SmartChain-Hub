"""
generate_training_data.py
Generates a realistic CSV training dataset for the SmartChain transaction optimizer.

Based on real patterns from:
- Ethereum gas price history (Etherscan)
- 0G Chain transaction patterns
- DeFi transaction size distributions

Usage:
    python3 generate_training_data.py
    # Outputs: ai-agent/data/training_data.csv
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 5000  # samples

# ── Realistic amount distribution (log-normal, matches real DeFi) ──
# Most txs are small ($10-$500), some are large ($1k-$50k)
amounts = np.exp(np.random.normal(6.0, 1.8, N))  # log-normal
amounts = np.clip(amounts, 5, 100_000)

# ── Priority (0=efficiency, 1=speed, 2=security) ──
priorities = np.random.choice([0, 1, 2], N, p=[0.5, 0.3, 0.2])

# ── Network congestion (0=low, 1=high) ──
# Bimodal: mostly low (0.1-0.4) with peak hours (0.6-0.9)
congestion = np.where(
    np.random.random(N) < 0.3,
    np.random.uniform(0.6, 0.95, N),   # 30% peak hours
    np.random.uniform(0.05, 0.45, N)   # 70% off-peak
)

# ── Time of day (0-23) ──
hour = np.random.randint(0, 24, N).astype(float)

# ── Gas price (Gwei) — correlated with congestion ──
base_gas = 20 + congestion * 80  # 20-100 Gwei
gas_price = base_gas * np.random.uniform(0.8, 1.2, N)

# ── Labels: what a good optimizer achieves ──

# Savings rate: how much cheaper than standard 1.5% fee
# Efficiency: saves most (0.8-1.4%), Speed: medium (0.5-1.0%), Security: least (0.2-0.6%)
base_savings_rate = np.array([0.012, 0.008, 0.004])[priorities]
# More savings when congestion is high (optimizer finds better routes)
congestion_bonus = congestion * 0.005
noise = np.random.normal(0, 0.001, N)
savings_rate = np.clip(base_savings_rate + congestion_bonus + noise, 0.001, 0.025)

# Confidence: model certainty
base_conf = np.array([0.94, 0.87, 0.81])[priorities]
time_penalty = np.abs(hour - 14) / 28  # lower confidence at odd hours
conf = np.clip(base_conf - time_penalty * 0.05 + np.random.normal(0, 0.01, N), 0.70, 0.99)

# Risk score: security route safest, speed riskiest
base_risk = np.array([0.08, 0.28, 0.04])[priorities]
risk = np.clip(base_risk * (1 + congestion * 0.3) + np.random.normal(0, 0.01, N), 0.01, 0.5)

# ── Build DataFrame ──
df = pd.DataFrame({
    'amount': np.round(amounts, 2),
    'priority': priorities,           # 0=efficiency, 1=speed, 2=security
    'congestion': np.round(congestion, 3),
    'hour': hour.astype(int),
    'gas_price_gwei': np.round(gas_price, 1),
    'savings_rate': np.round(savings_rate, 5),
    'confidence': np.round(conf, 4),
    'risk_score': np.round(risk, 4),
})

os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'data'), exist_ok=True)
out_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'training_data.csv')
df.to_csv(out_path, index=False)
print(f"Generated {N} samples → {out_path}")
print(df.describe().round(4))
