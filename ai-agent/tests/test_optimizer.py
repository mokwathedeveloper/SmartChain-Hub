import pytest
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.optimizer import TransactionOptimizer

def test_optimization_returns_required_fields():
    optimizer = TransactionOptimizer()
    res = optimizer.optimize(1000, 'efficiency')
    assert "route" in res
    assert "fee" in res
    assert "savings" in res
    assert "confidence" in res
    assert "ml_engine" in res

def test_fee_is_positive():
    optimizer = TransactionOptimizer()
    res = optimizer.optimize(1000, 'efficiency')
    assert res['fee'] > 0

def test_savings_is_non_negative():
    optimizer = TransactionOptimizer()
    res = optimizer.optimize(1000, 'efficiency')
    assert res['savings'] >= 0

def test_confidence_in_valid_range():
    optimizer = TransactionOptimizer()
    res = optimizer.optimize(1000, 'speed')
    assert 0 < res['confidence'] <= 100

def test_invalid_priority_falls_back():
    optimizer = TransactionOptimizer()
    res = optimizer.optimize(500, 'unknown')
    assert res['route'] is not None
    assert res['fee'] > 0

def test_all_priorities_work():
    optimizer = TransactionOptimizer()
    for priority in ['efficiency', 'speed', 'security']:
        res = optimizer.optimize(1000, priority)
        assert res['fee'] > 0, f"fee should be positive for priority={priority}"

def test_larger_amount_has_larger_fee():
    optimizer = TransactionOptimizer()
    small = optimizer.optimize(100, 'efficiency')
    large = optimizer.optimize(10000, 'efficiency')
    assert large['fee'] > small['fee']
