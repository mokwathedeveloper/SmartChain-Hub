import numpy as np
import pandas as pd
import tensorflow as tf
import os
import sys

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.savings_model import SavingsModel

def train_with_custom_data(csv_path):
    print(f"--- Starting Retraining with {csv_path} ---")
    
    # 1. Load Data
    # Expected CSV columns: amount, priority_idx, actual_savings_rate
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    x_train = df[['amount', 'priority_idx']].values
    y_train = df['actual_savings_rate'].values

    # 2. Initialize Model
    ai_model = SavingsModel()
    
    # 3. Fine-tune the model
    print("Fitting model to new data...")
    ai_model.model.fit(
        x_train, 
        y_train, 
        epochs=100, 
        batch_size=32, 
        validation_split=0.2,
        verbose=1
    )

    # 4. Save the upgraded version
    ai_model.model.save('ai-agent/models/tf_savings_model.keras')
    print("--- Model Successfully Upgraded and Saved! ---")

if __name__ == "__main__":
    # Example: Create a dummy CSV for demonstration if it doesn't exist
    if not os.path.exists('ai-agent/data/training_data.csv'):
        os.makedirs('ai-agent/data', exist_ok=True)
        dummy_data = {
            'amount': np.random.uniform(10, 10000, 100),
            'priority_idx': np.random.randint(0, 3, 100),
            'actual_savings_rate': np.random.uniform(0.005, 0.03, 100)
        }
        pd.DataFrame(dummy_data).to_csv('ai-agent/data/training_data.csv', index=False)
    
    train_with_custom_data('ai-agent/data/training_data.csv')
