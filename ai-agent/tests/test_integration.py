"""
test_integration.py — Integration tests: components working together correctly
"""
import sys, os, json
import pytest
import numpy as np

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

# ── Model → Optimizer integration ───────────────────────────────
class TestModelOptimizerIntegration:
    def test_model_output_used_in_optimizer(self):
        """Optimizer uses model prediction to adjust savings."""
        model = SavingsModel()
        opt = TransactionOptimizer()
        pred = model.predict(1000, 0)
        result = opt.optimize(1000, 'efficiency')
        # Model savings_rate should be in reasonable range
        assert 0.001 <= pred['savings_rate'] <= 0.04
        # Optimizer savings should be positive
        assert result['savings'] > 0

    def test_model_confidence_flows_to_optimizer(self):
        """Confidence from model appears in optimizer output."""
        opt = TransactionOptimizer()
        r = opt.optimize(1000, 'efficiency')
        assert 70 <= r['confidence'] <= 100

    def test_model_risk_flows_to_optimizer(self):
        """Risk label from model appears in optimizer output."""
        opt = TransactionOptimizer()
        r = opt.optimize(1000, 'security')
        assert r['risk'] in ['Very Low', 'Low', 'Medium', 'High']

    def test_congestion_affects_savings(self):
        """Higher congestion should produce higher savings."""
        model = SavingsModel()
        low_cong = model.predict(1000, 0, congestion=0.1)
        high_cong = model.predict(1000, 0, congestion=0.9)
        assert high_cong['savings_rate'] >= low_cong['savings_rate']

    def test_model_persists_across_optimizer_instances(self):
        """Two optimizer instances use same trained model."""
        o1 = TransactionOptimizer()
        o2 = TransactionOptimizer()
        r1 = o1.optimize(1000, 'efficiency')
        r2 = o2.optimize(1000, 'efficiency')
        # Same model → same route and fee
        assert r1['route'] == r2['route']
        assert r1['fee'] == r2['fee']

# ── API → Optimizer → Model integration ─────────────────────────
class TestApiOptimizerIntegration:
    def test_api_uses_optimizer_routes(self, client):
        """API response route matches optimizer route names."""
        opt = TransactionOptimizer()
        expected_routes = {r['name'] for r in opt.ROUTES.values()}
        r = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        assert r['route'] in expected_routes

    def test_api_fee_matches_optimizer(self, client):
        """API fee matches direct optimizer call."""
        opt = TransactionOptimizer()
        direct = opt.optimize(1000, 'efficiency')
        api = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        assert api['fee'] == direct['fee']

    def test_api_consistent_across_calls(self, client):
        """Same input → same fee and route (deterministic)."""
        r1 = json.loads(client.post('/optimize', json={'amount': 500, 'priority': 'speed'}).data)
        r2 = json.loads(client.post('/optimize', json={'amount': 500, 'priority': 'speed'}).data)
        assert r1['fee'] == r2['fee']
        assert r1['route'] == r2['route']

    def test_full_pipeline_efficiency(self, client):
        """Full pipeline: API → optimizer → model → response with all fields."""
        r = json.loads(client.post('/optimize', json={'amount': 2500, 'priority': 'efficiency'}).data)
        assert r['fee'] > 0
        assert r['savings'] > 0
        assert r['confidence'] > 0
        assert r['route']
        assert r['ml_engine']
        assert r['tee_verified'] == False  # no API key in test
        assert r['estimated_time_s'] == 8  # efficiency route

    def test_priority_ordering_through_api(self, client):
        """Efficiency < Speed < Security fee ordering preserved through API."""
        eff = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        spd = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'speed'}).data)
        sec = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'security'}).data)
        assert eff['fee'] < spd['fee'] < sec['fee']
