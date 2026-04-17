"""
test_functional.py — Functional tests: each feature works correctly end-to-end
"""
import sys, os, json
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['OG_COMPUTE_API_KEY'] = ''

from server.app import app
from scripts.optimizer import TransactionOptimizer

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c

# ── Optimizer functional ─────────────────────────────────────────
class TestOptimizerFunctional:
    def setup_method(self):
        self.opt = TransactionOptimizer()

    def test_efficiency_cheapest_fee(self):
        eff = self.opt.optimize(1000, 'efficiency')
        spd = self.opt.optimize(1000, 'speed')
        sec = self.opt.optimize(1000, 'security')
        assert eff['fee'] < spd['fee'] < sec['fee']

    def test_efficiency_most_savings(self):
        eff = self.opt.optimize(1000, 'efficiency')
        sec = self.opt.optimize(1000, 'security')
        assert eff['savings'] > sec['savings']

    def test_speed_fastest(self):
        spd = self.opt.optimize(1000, 'speed')
        eff = self.opt.optimize(1000, 'efficiency')
        assert spd['estimated_time_s'] < eff['estimated_time_s']

    def test_security_slowest_safest(self):
        sec = self.opt.optimize(1000, 'security')
        assert sec['estimated_time_s'] == 15

    def test_fee_scales_with_amount(self):
        small = self.opt.optimize(100, 'efficiency')
        large = self.opt.optimize(10000, 'efficiency')
        assert large['fee'] > small['fee']

    def test_savings_scales_with_amount(self):
        small = self.opt.optimize(100, 'efficiency')
        large = self.opt.optimize(10000, 'efficiency')
        assert large['savings'] > small['savings']

    def test_all_routes_are_named(self):
        for p in ['efficiency', 'speed', 'security']:
            r = self.opt.optimize(1000, p)
            assert len(r['route']) > 5

    def test_confidence_higher_for_efficiency(self):
        eff = self.opt.optimize(1000, 'efficiency')
        sec = self.opt.optimize(1000, 'security')
        assert eff['confidence'] > sec['confidence']

# ── API functional ───────────────────────────────────────────────
class TestApiFunctional:
    def test_optimize_efficiency_cheaper_than_security(self, client):
        eff = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        sec = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'security'}).data)
        assert eff['fee'] < sec['fee']

    def test_optimize_returns_0g_route(self, client):
        r = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        assert '0G' in r['route'] or 'Route' in r['route']

    def test_optimize_tee_fields_present(self, client):
        r = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 'tee_verified' in r
        assert 'tee_mode' in r
        assert 'provider_id' in r

    def test_optimize_explanation_matches_priority(self, client):
        r = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'speed'}).data)
        assert 'speed' in r.get('explanation', '').lower() or 'node' in r.get('explanation', '').lower()
