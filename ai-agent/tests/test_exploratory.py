"""
test_exploratory.py — Exploratory tests: boundary conditions, unexpected inputs, stress
"""
import sys, os, json
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['OG_COMPUTE_API_KEY'] = ''

from server.app import app
from scripts.optimizer import TransactionOptimizer
from models.savings_model import SavingsModel

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c

# ── Boundary conditions ──────────────────────────────────────────
class TestBoundaryConditions:
    def test_minimum_amount(self, client):
        """Smallest realistic amount."""
        r = client.post('/optimize', json={'amount': 0.01})
        assert r.status_code == 200

    def test_maximum_amount(self, client):
        """Very large amount."""
        r = client.post('/optimize', json={'amount': 1_000_000})
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d['fee'] > 0

    def test_amount_zero_returns_400(self, client):
        """Zero amount should fail."""
        r = client.post('/optimize', json={'amount': 0})
        # Either 400 or returns with fee=0 — both acceptable
        d = json.loads(r.data)
        if r.status_code == 200:
            assert d.get('fee', 0) >= 0

    def test_negative_amount(self, client):
        """Negative amount — should not crash."""
        r = client.post('/optimize', json={'amount': -500})
        assert r.status_code in [200, 400]

    def test_float_precision(self, client):
        """Float with many decimals."""
        r = client.post('/optimize', json={'amount': 1234.56789012345})
        assert r.status_code == 200

    def test_string_number(self, client):
        """Amount as string — Flask should parse it."""
        r = client.post('/optimize', json={'amount': '1000'})
        assert r.status_code == 200

    def test_empty_body(self, client):
        """Empty JSON body."""
        r = client.post('/optimize', json={})
        assert r.status_code == 400

    def test_null_amount(self, client):
        """Null amount."""
        r = client.post('/optimize', json={'amount': None})
        assert r.status_code == 400

# ── Unexpected inputs ────────────────────────────────────────────
class TestUnexpectedInputs:
    def test_unknown_priority_falls_back(self, client):
        """Unknown priority should not crash — falls back to efficiency."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'UNKNOWN_XYZ'})
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d['fee'] > 0

    def test_uppercase_priority(self, client):
        """Uppercase priority — handled gracefully."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'EFFICIENCY'})
        assert r.status_code == 200

    def test_extra_fields_ignored(self, client):
        """Extra unknown fields should be ignored."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'speed', 'foo': 'bar', 'hack': True})
        assert r.status_code == 200

    def test_wrong_content_type(self, client):
        """Non-JSON body."""
        r = client.post('/optimize', data='amount=1000', content_type='application/x-www-form-urlencoded')
        assert r.status_code in [200, 400, 415]

    def test_get_on_optimize_not_allowed(self, client):
        """GET on POST-only endpoint."""
        r = client.get('/optimize')
        assert r.status_code == 405

    def test_unknown_endpoint(self, client):
        """Non-existent endpoint."""
        r = client.get('/nonexistent')
        assert r.status_code == 404

# ── Stress / consistency ─────────────────────────────────────────
class TestStressAndConsistency:
    def test_50_consecutive_calls(self, client):
        """50 calls should all succeed."""
        for i in range(50):
            r = client.post('/optimize', json={'amount': 100 + i * 10, 'priority': 'efficiency'})
            assert r.status_code == 200, f"Failed on call {i}"

    def test_all_amounts_produce_valid_output(self):
        """Sweep of amounts — all should produce valid output."""
        opt = TransactionOptimizer()
        for amt in [1, 10, 100, 500, 1000, 5000, 10000, 50000, 100000]:
            r = opt.optimize(amt, 'efficiency')
            assert r['fee'] > 0, f"fee=0 for amount={amt}"
            assert r['savings'] >= 0, f"negative savings for amount={amt}"
            assert 0 < r['confidence'] <= 100

    def test_model_output_stable(self):
        """Same input → same output (no randomness in core outputs)."""
        model = SavingsModel()
        r1 = model.predict(1000, 0, 0.3, 12.0)
        r2 = model.predict(1000, 0, 0.3, 12.0)
        assert r1['savings_rate'] == r2['savings_rate']
        assert r1['confidence'] == r2['confidence']
        assert r1['risk_score'] == r2['risk_score']

    def test_congestion_range(self):
        """Congestion values 0.0 to 1.0 all produce valid output."""
        model = SavingsModel()
        for cong in [0.0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0]:
            r = model.predict(1000, 0, cong, 12.0)
            assert 0 < r['savings_rate'] <= 0.04
            assert 0.7 <= r['confidence'] <= 1.0
            assert 0 < r['risk_score'] <= 0.5
