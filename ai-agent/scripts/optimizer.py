import datetime
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.savings_model import SavingsModel
from constants import ROUTE_PARAMS, STANDARD_FEE_PCT

class TransactionOptimizer:
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
        route = ROUTE_PARAMS.get(priority, ROUTE_PARAMS['efficiency'])
        congestion = self._get_congestion()
        hour = float(datetime.datetime.now().hour)

        # Get all 3 outputs from the improved model
        prediction = self.model.predict(amount, priority_idx, congestion, hour)

        standard_fee = amount * STANDARD_FEE_PCT
        optimized_fee = amount * route["fee_pct"]
        savings = max(0.0, standard_fee - optimized_fee)

        # Clamp savings_rate to training range (max 4%) — prevents out-of-distribution
        # predictions from producing absurd savings for very large amounts (>$100k)
        clamped_rate = min(prediction["savings_rate"], 0.04)
        model_savings = amount * clamped_rate
        final_savings = round(min((savings + model_savings) / 2, amount * 0.20), 2)

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
