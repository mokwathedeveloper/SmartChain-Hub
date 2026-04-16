from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the scripts directory to path to import TransactionOptimizer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.optimizer import TransactionOptimizer

app = Flask(__name__)
CORS(app)

optimizer = TransactionOptimizer()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "agent": "SmartChain AI v1.0"})

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

    result = optimizer.optimize(amount, priority)
    
    # Add AI reasoning as per UX docs
    explanations = {
        'efficiency': "The AI prioritized lower gas fees by selecting a high-throughput route with minimized relay costs.",
        'speed': "The AI selected the route with the highest node availability and lowest block finality time.",
        'security': "The AI prioritized routes with the highest number of decentralized validators and verifiable compute proofs."
    }
    
    result['explanation'] = explanations.get(priority, "AI optimized your transaction for best performance.")
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
