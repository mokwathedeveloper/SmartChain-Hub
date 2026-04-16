import pytest
import sys
import os

# Add the root directory to path to import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.optimizer import TransactionOptimizer

def test_optimization_logic():
    optimizer = TransactionOptimizer()
    
    # Test Efficiency Priority (Lowest Cost)
    res = optimizer.optimize(1000, 'efficiency')
    assert "route" in res
    assert res['fee'] < 1000 * 0.02 # Must be cheaper than standard 2%
    assert "ml_engine" in res
    
    # Test Speed Priority
    res_speed = optimizer.optimize(1000, 'speed')
    assert res_speed['confidence'] > 0

def test_invalid_priority():
    optimizer = TransactionOptimizer()
    # Should fallback to default efficiency
    res = optimizer.optimize(500, 'non-existent-priority')
    assert res['route'] is not None
    assert res['fee'] > 0

def test_neural_network_prediction():
    optimizer = TransactionOptimizer()
    # Ensure TF model is working
    res1 = optimizer.optimize(100, 'efficiency')
    res2 = optimizer.optimize(5000, 'efficiency')
    
    # Savings rate should vary by amount
    rate1 = res1['savings'] / 100
    rate2 = res2['savings'] / 5000
    
    assert rate1 != rate2
