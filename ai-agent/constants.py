"""Shared constants for the SmartChain AI agent — imported by both
server/app.py and scripts/optimizer.py to avoid duplicating definitions."""

STANDARD_FEE_PCT = 0.015  # 1.5% market-standard fee used as baseline

ROUTE_PARAMS = {
    'efficiency': {"name": "0G Chain Flash Route",           "fee_pct": 0.003, "time_s": 8},
    'speed':      {"name": "Standard Layer 2 Aggregator",    "fee_pct": 0.005, "time_s": 3},
    'security':   {"name": "Decentralized Liquidity Bridge", "fee_pct": 0.008, "time_s": 15},
}
