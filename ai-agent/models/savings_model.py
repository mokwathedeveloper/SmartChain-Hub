import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers

class SavingsModel:
    """
    Multi-feature neural network for transaction optimization.
    
    Features (6):
      0: amount_norm       — transaction amount normalized to [0,1] (log scale)
      1: priority_eff      — one-hot: efficiency priority
      2: priority_spd      — one-hot: speed priority
      3: priority_sec      — one-hot: security priority
      4: congestion        — simulated network congestion [0,1]
      5: time_of_day_norm  — hour/24 [0,1]
    
    Outputs (3):
      0: savings_rate      — predicted savings as fraction of amount
      1: confidence        — model confidence [0,1]
      2: risk_score        — route risk [0,1] (lower = safer)
    """

    AMOUNT_LOG_MAX = np.log1p(100_000)  # normalize up to $100k

    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'tf_savings_model.keras')
        self.model_path = model_path
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
        else:
            self.model = self._build_model()
            self._train()

    def _build_model(self):
        model = tf.keras.Sequential([
            layers.Input(shape=(6,)),
            layers.Dense(64, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.1),
            layers.Dense(32, activation='relu'),
            layers.Dense(16, activation='relu'),
            layers.Dense(3, activation='sigmoid'),  # savings_rate, confidence, risk
        ])
        model.compile(optimizer=tf.keras.optimizers.Adam(0.001), loss='mse', metrics=['mae'])
        return model

    def _make_features(self, amount, priority_idx, congestion=0.3, hour=12.0):
        """Build normalized feature vector."""
        amount_norm = np.log1p(float(amount)) / self.AMOUNT_LOG_MAX
        one_hot = [float(priority_idx == i) for i in range(3)]
        return [amount_norm] + one_hot + [float(congestion), float(hour) / 24.0]

    def _train(self):
        """Generate rich synthetic training data and train the model."""
        np.random.seed(42)
        X, y = [], []

        amounts = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 50000]
        priorities = [0, 1, 2]  # efficiency, speed, security
        congestions = [0.1, 0.3, 0.5, 0.7, 0.9]
        hours = [2, 8, 12, 16, 20, 23]

        for amt in amounts:
            for pri in priorities:
                for cong in congestions:
                    for hr in hours:
                        feat = self._make_features(amt, pri, cong, hr)

                        # Savings rate: efficiency > speed > security
                        # Higher congestion = more savings from optimization
                        base_savings = [0.022, 0.014, 0.008][pri]
                        savings = base_savings * (1 + cong * 0.5) * np.random.uniform(0.9, 1.1)
                        savings = np.clip(savings, 0.001, 0.04)

                        # Confidence: higher for efficiency, lower at peak hours
                        peak = 1.0 - abs(hr - 14) / 14.0  # peak at 2pm
                        conf = [0.95, 0.88, 0.82][pri] * (1 - peak * 0.05) * np.random.uniform(0.97, 1.0)
                        conf = np.clip(conf, 0.7, 0.99)

                        # Risk: security route is safest, speed is riskiest
                        risk = [0.1, 0.3, 0.05][pri] * (1 + cong * 0.2) * np.random.uniform(0.9, 1.1)
                        risk = np.clip(risk, 0.01, 0.5)

                        X.append(feat)
                        y.append([savings, conf, risk])

        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)

        self.model.fit(X, y, epochs=200, batch_size=32, validation_split=0.1, verbose=0)
        self.model.save(self.model_path)

    def predict(self, amount: float, priority_idx: int, congestion: float = 0.3, hour: float = None) -> dict:
        """Returns savings_rate, confidence, risk_score."""
        if hour is None:
            import datetime
            hour = float(datetime.datetime.now().hour)
        feat = np.array([self._make_features(amount, priority_idx, congestion, hour)], dtype=np.float32)
        out = self.model.predict(feat, verbose=0)[0]
        return {
            "savings_rate": float(np.clip(out[0], 0.001, 0.04)),
            "confidence":   float(np.clip(out[1], 0.70, 0.99)),
            "risk_score":   float(np.clip(out[2], 0.01, 0.50)),
        }

    # Backward-compatible method
    def predict_savings(self, amount, priority_idx):
        return self.predict(float(amount), int(priority_idx))["savings_rate"]


if __name__ == "__main__":
    m = SavingsModel()
    for pri, name in enumerate(['efficiency', 'speed', 'security']):
        r = m.predict(1000, pri)
        print(f"{name}: savings={r['savings_rate']:.4f} conf={r['confidence']:.3f} risk={r['risk_score']:.3f}")
