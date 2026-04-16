# optimizeTransaction.py — entry point alias for the TransactionOptimizer
# The core logic lives in optimizer.py (TransactionOptimizer class)
from optimizer import TransactionOptimizer

def optimize_transaction(amount: float, priority: str = 'efficiency') -> dict:
    """
    Optimize a transaction given amount and priority.
    Returns: { fee, savings, route, confidence, ml_engine, explanation }
    """
    optimizer = TransactionOptimizer()
    result = optimizer.optimize(amount, priority)
    explanations = {
        'efficiency': "AI prioritized lower gas fees via high-throughput route selection.",
        'speed': "AI selected the route with lowest block finality time.",
        'security': "AI prioritized routes with the most decentralized validators.",
    }
    result['explanation'] = explanations.get(priority, "AI optimized your transaction.")
    return result

if __name__ == '__main__':
    import json
    print(json.dumps(optimize_transaction(1000, 'efficiency'), indent=2))
