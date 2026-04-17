import datetime
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.savings_model import SavingsModel

class TransactionOptimizer:
    STANDARD_FEE_PCT = 0.015  # 1.5% market standard

    ROUTES = {
        'efficiency': {"name": "0G Chain Flash Route",          "base_fee_pct": 0.003, "time_s": 8},
        'speed':      {"name": "Standard Layer 2 Aggregator",   "base_fee_pct": 0.005, "time_s": 3},
        'security':   {"name": "Decentralized Liquidity Bridge", "base_fee_pct": 0.008, "time_s": 15},
    }

    PRIORITY_MAP = {'efficiency': 0, 'speed': 1, 'security': 2}

    def __init__(self):
        self.model = SavingsModel()

    def _get_congestion(self) -> float:
        """Estimate network congestion from time of day (0=low, 1=high)."""
        hour = datetime.datetime.now().hour
        # Peak hours: 9-11am, 2-4pm UTC
        if 9 <= hour <= 11 or 14 <= hour <= 16:
            return 0.7
        elif 0 <= hour <= 5:
            return 0.15
        return 0.4

    def optimize(self, amount: float, priority: str = 'efficiency') -> dict:
        priority_idx = self.PRIORITY_MAP.get(priority, 0)
        route = self.ROUTES.get(priority, self.ROUTES['efficiency'])
        congestion = self._get_congestion()
        hour = float(datetime.datetime.now().hour)

        # Get all 3 outputs from the improved model
        prediction = self.model.predict(amount, priority_idx, congestion, hour)

        standard_fee = amount * self.STANDARD_FEE_PCT
        optimized_fee = amount * route["base_fee_pct"]
        savings = max(0.0, standard_fee - optimized_fee)

        # Adjust savings slightly using model's predicted rate
        model_savings = amount * prediction["savings_rate"]
        final_savings = round((savings + model_savings) / 2, 2)

        risk_labels = {(0.0, 0.1): "Very Low", (0.1, 0.2): "Low", (0.2, 0.35): "Medium", (0.35, 1.0): "High"}
        risk = prediction["risk_score"]
        risk_label = next((v for (lo, hi), v in risk_labels.items() if lo <= risk < hi), "Low")

        return {
            "route": route["name"],
            "fee": round(max(optimized_fee, 0.01), 2),
            "savings": final_savings,
            "confidence": round(prediction["confidence"] * 100, 1),  # 0-100 for UI
            "risk": risk_label,
            "congestion": round(congestion * 100),  # % for UI
            "ml_engine": "TensorFlow v2.16 (6-feature model)",
            "estimated_time_s": route["time_s"],
        }


if __name__ == "__main__":
    o = TransactionOptimizer()
    for p in ['efficiency', 'speed', 'security']:
        print(f"{p}:", o.optimize(1000, p))
