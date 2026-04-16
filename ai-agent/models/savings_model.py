import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers

class SavingsModel:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'tf_savings_model.keras')
        self.model_path = model_path
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
        else:
            self.model = self._build_model()
            self._train_initial_model()

    def _build_model(self):
        # Input: Amount, Priority (Encoded: efficiency=0, speed=1, security=2)
        model = tf.keras.Sequential([
            layers.Dense(16, activation='relu', input_shape=(2,)),
            layers.Dense(8, activation='relu'),
            layers.Dense(1) # Output: Predicted Savings Percentage
        ])
        model.compile(optimizer='adam', loss='mse')
        return model

    def _train_initial_model(self):
        # Synthetic data for initial training
        # [Amount (normalized), Priority]
        x_train = np.array([
            [100, 0], [500, 0], [1000, 0], [5000, 0], # Efficiency
            [100, 1], [500, 1], [1000, 1], [5000, 1], # Speed
            [100, 2], [500, 2], [1000, 2], [5000, 2]  # Security
        ], dtype=float)
        
        # Predicted Savings % (Synthetic labels)
        y_train = np.array([
            0.025, 0.022, 0.020, 0.018, # Efficiency (higher savings)
            0.015, 0.014, 0.013, 0.012, # Speed
            0.010, 0.009, 0.008, 0.007  # Security (lower savings due to overhead)
        ], dtype=float)

        self.model.fit(x_train, y_train, epochs=50, verbose=0)
        self.model.save(self.model_path)

    def predict_savings(self, amount, priority_idx):
        input_data = np.array([[float(amount), float(priority_idx)]])
        prediction = self.model.predict(input_data, verbose=0)
        return float(prediction[0][0])

if __name__ == "__main__":
    model = SavingsModel()
    print(f"Predicted Savings rate for $1000 (Efficiency): {model.predict_savings(1000, 0)}")
