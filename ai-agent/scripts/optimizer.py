import json
import random

class TransactionOptimizer:
    def __init__(self):
        # Sample routes with weights: [Speed, Cost, Security] (0-10 scale)
        self.routes = [
            {"name": "0G Chain Flash Route", "speed": 9, "cost": 2, "security": 8},
            {"name": "Decentralized Liquidity Bridge", "speed": 6, "cost": 4, "security": 9},
            {"name": "Standard Layer 2 Aggregator", "speed": 7, "cost": 3, "security": 7},
            {"name": "Direct Peer Optimizer", "speed": 5, "cost": 1, "security": 6}
        ]

    def optimize(self, amount, priority='efficiency'):
        """
        Optimizes transaction based on user priority.
        priority can be: 'efficiency' (cost), 'speed', or 'security'
        """
        best_route = None
        max_score = -1

        for route in self.routes:
            score = 0
            if priority == 'efficiency':
                # Higher weight on LOW cost (10 - cost)
                score = (10 - route['cost']) * 0.7 + route['speed'] * 0.15 + route['security'] * 0.15
            elif priority == 'speed':
                score = route['speed'] * 0.7 + (10 - route['cost']) * 0.15 + route['security'] * 0.15
            elif priority == 'security':
                score = route['security'] * 0.7 + route['speed'] * 0.15 + (10 - route['cost']) * 0.15
            
            # Add a small random factor to simulate real-time network fluctuations
            score += random.uniform(0, 0.5)

            if score > max_score:
                max_score = score
                best_route = route

        # Calculate results based on route
        fee_percentage = best_route['cost'] * 0.001 # e.g. cost 2 = 0.2%
        fee = amount * fee_percentage
        savings = amount * 0.02 - fee # Assuming standard 2% fee elsewhere
        
        return {
            "route": best_route['name'],
            "fee": round(fee, 2),
            "savings": round(savings, 2),
            "confidence": round(max_score / 10 * 100, 1)
        }

if __name__ == "__main__":
    optimizer = TransactionOptimizer()
    # Test for different priorities
    print("Efficiency Priority:", optimizer.optimize(1000, 'efficiency'))
    print("Speed Priority:", optimizer.optimize(1000, 'speed'))
    print("Security Priority:", optimizer.optimize(1000, 'security'))
