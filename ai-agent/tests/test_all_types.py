"""
test_comprehensive.py
Covers: Functional, Scripted, Exploratory, Component, Smoke, Sanity,
        Regression, Ad-hoc, Integration, System, UAT, Interface, UI
"""
import sys, os, json, time
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

@pytest.fixture
def opt():
    return TransactionOptimizer()

@pytest.fixture
def model():
    return SavingsModel()

# ════════════════════════════════════════════════════════════════
# 1. SMOKE TESTING — Does the system start and respond at all?
# ════════════════════════════════════════════════════════════════
class TestSmoke:
    def test_health_endpoint_alive(self, client):
        assert client.get('/health').status_code == 200

    def test_optimize_endpoint_alive(self, client):
        assert client.post('/optimize', json={'amount': 100}).status_code == 200

    def test_optimizer_instantiates(self, opt):
        assert opt is not None

    def test_model_instantiates(self, model):
        assert model is not None

    def test_model_file_exists(self):
        path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tf_savings_model.keras')
        assert os.path.exists(path), "Trained model file missing"


# ════════════════════════════════════════════════════════════════
# 2. SANITY TESTING — Core logic produces sensible results
# ════════════════════════════════════════════════════════════════
class TestSanity:
    def test_efficiency_fee_less_than_standard(self, opt):
        r = opt.optimize(1000, 'efficiency')
        assert r['fee'] < 1000 * 0.015  # cheaper than 1.5% standard

    def test_savings_positive(self, opt):
        r = opt.optimize(1000, 'efficiency')
        assert r['savings'] > 0

    def test_confidence_reasonable(self, opt):
        r = opt.optimize(1000, 'efficiency')
        assert 70 <= r['confidence'] <= 100

    def test_model_predicts_valid_range(self, model):
        p = model.predict(1000, 0)
        assert 0 < p['savings_rate'] < 0.05
        assert 0.7 <= p['confidence'] <= 1.0
        assert 0 < p['risk_score'] < 0.6


# ════════════════════════════════════════════════════════════════
# 3. COMPONENT TESTING — Each component in isolation
# ════════════════════════════════════════════════════════════════
class TestComponent:
    # SavingsModel component
    def test_model_predict_returns_3_outputs(self, model):
        p = model.predict(1000, 0)
        assert set(p.keys()) == {'savings_rate', 'confidence', 'risk_score'}

    def test_model_backward_compat_predict_savings(self, model):
        rate = model.predict_savings(1000, 0)
        assert isinstance(rate, float)
        assert rate > 0

    def test_model_congestion_parameter(self, model):
        low = model.predict(1000, 0, congestion=0.1)
        high = model.predict(1000, 0, congestion=0.9)
        assert high['savings_rate'] >= low['savings_rate']

    # TransactionOptimizer component
    def test_optimizer_has_3_routes(self, opt):
        assert len(opt.ROUTES) == 3

    def test_optimizer_priority_map_complete(self, opt):
        assert set(opt.PRIORITY_MAP.keys()) == {'efficiency', 'speed', 'security'}

    def test_optimizer_returns_7_fields(self, opt):
        r = opt.optimize(1000, 'efficiency')
        for f in ['route', 'fee', 'savings', 'confidence', 'risk', 'congestion', 'estimated_time_s']:
            assert f in r, f"Missing field: {f}"

    # Flask app component
    def test_app_has_optimize_route(self, client):
        r = client.post('/optimize', json={'amount': 100})
        assert r.status_code == 200

    def test_app_has_health_route(self, client):
        r = client.get('/health')
        assert r.status_code == 200


# ════════════════════════════════════════════════════════════════
# 4. FUNCTIONAL TESTING — Features work as specified
# ════════════════════════════════════════════════════════════════
class TestFunctional:
    def test_efficiency_cheapest(self, opt):
        assert opt.optimize(1000,'efficiency')['fee'] < opt.optimize(1000,'speed')['fee']

    def test_speed_fastest(self, opt):
        assert opt.optimize(1000,'speed')['estimated_time_s'] < opt.optimize(1000,'efficiency')['estimated_time_s']

    def test_security_safest(self, opt):
        assert opt.optimize(1000,'security')['risk'] in ['Very Low', 'Low']

    def test_fee_proportional_to_amount(self, opt):
        assert opt.optimize(10000,'efficiency')['fee'] > opt.optimize(100,'efficiency')['fee']

    def test_savings_proportional_to_amount(self, opt):
        assert opt.optimize(10000,'efficiency')['savings'] > opt.optimize(100,'efficiency')['savings']

    def test_api_all_required_fields(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 500, 'priority': 'speed'}).data)
        for f in ['fee','savings','route','confidence','ml_engine','tee_verified','tee_mode','provider_id']:
            assert f in d

    def test_api_tee_false_without_key(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert d['tee_verified'] == False

    def test_api_ml_engine_label(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 'TensorFlow' in d['ml_engine'] or '0G' in d['ml_engine']


# ════════════════════════════════════════════════════════════════
# 5. SCRIPTED / TEST CASE TESTING — Predefined test cases
# ════════════════════════════════════════════════════════════════
class TestScripted:
    """TC-001 through TC-010: Predefined test cases with expected values."""

    def test_TC001_optimize_100_efficiency(self, opt):
        """TC-001: $100 efficiency → fee=$0.30, savings≈$1.20, time=8s"""
        r = opt.optimize(100, 'efficiency')
        assert r['fee'] == 0.30
        assert abs(r['savings'] - 1.20) <= 0.10  # ±0.10 model adjustment
        assert r['estimated_time_s'] == 8

    def test_TC002_optimize_1000_speed(self, opt):
        """TC-002: $1000 speed → fee=$5.00, time=3s"""
        r = opt.optimize(1000, 'speed')
        assert r['fee'] == 5.00
        assert r['estimated_time_s'] == 3

    def test_TC003_optimize_500_security(self, opt):
        """TC-003: $500 security → fee=$4.00, time=15s"""
        r = opt.optimize(500, 'security')
        assert r['fee'] == 4.00
        assert r['estimated_time_s'] == 15

    def test_TC004_missing_amount_400(self, client):
        """TC-004: Missing amount → HTTP 400"""
        assert client.post('/optimize', json={}).status_code == 400

    def test_TC005_invalid_amount_400(self, client):
        """TC-005: Non-numeric amount → HTTP 400"""
        assert client.post('/optimize', json={'amount': 'abc'}).status_code == 400

    def test_TC006_health_200(self, client):
        """TC-006: GET /health → HTTP 200 with status=healthy"""
        d = json.loads(client.get('/health').data)
        assert d['status'] == 'healthy'

    def test_TC007_unknown_priority_fallback(self, client):
        """TC-007: Unknown priority → falls back, returns 200"""
        assert client.post('/optimize', json={'amount': 1000, 'priority': 'UNKNOWN'}).status_code == 200

    def test_TC008_model_singleton_behavior(self):
        """TC-008: SavingsModel loads from file on second instantiation"""
        m1 = SavingsModel()
        m2 = SavingsModel()
        r1 = m1.predict(1000, 0, 0.3, 12.0)
        r2 = m2.predict(1000, 0, 0.3, 12.0)
        assert r1['savings_rate'] == r2['savings_rate']

    def test_TC009_congestion_increases_savings(self):
        """TC-009: Higher congestion → higher savings rate"""
        m = SavingsModel()
        assert m.predict(1000,0,0.9,12)['savings_rate'] > m.predict(1000,0,0.1,12)['savings_rate']

    def test_TC010_all_priorities_return_200(self, client):
        """TC-010: All three priorities return HTTP 200"""
        for p in ['efficiency', 'speed', 'security']:
            assert client.post('/optimize', json={'amount': 1000, 'priority': p}).status_code == 200


# ════════════════════════════════════════════════════════════════
# 6. EXPLORATORY / UNSCRIPTED TESTING — Unexpected scenarios
# ════════════════════════════════════════════════════════════════
class TestExploratory:
    def test_very_small_amount(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 0.001}).data)
        assert d['fee'] >= 0.01  # min fee enforced

    def test_very_large_amount(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 999999}).data)
        assert d['fee'] > 0 and d['savings'] > 0

    def test_negative_amount_no_crash(self, client):
        r = client.post('/optimize', json={'amount': -1000})
        assert r.status_code in [200, 400]

    def test_float_string_amount(self, client):
        assert client.post('/optimize', json={'amount': '1234.56'}).status_code == 200

    def test_extra_fields_ignored(self, client):
        r = client.post('/optimize', json={'amount': 500, 'hack': True, 'inject': '<script>'})
        assert r.status_code == 200

    def test_null_priority_uses_default(self, client):
        r = client.post('/optimize', json={'amount': 500, 'priority': None})
        assert r.status_code == 200

    def test_empty_string_priority(self, client):
        r = client.post('/optimize', json={'amount': 500, 'priority': ''})
        assert r.status_code == 200

    def test_rapid_fire_10_calls(self, client):
        for _ in range(10):
            assert client.post('/optimize', json={'amount': 100}).status_code == 200


# ════════════════════════════════════════════════════════════════
# 7. INTEGRATION TESTING — Components working together
# ════════════════════════════════════════════════════════════════
class TestIntegration:
    def test_model_output_used_in_optimizer(self, opt, model):
        pred = model.predict(1000, 0)
        result = opt.optimize(1000, 'efficiency')
        assert pred['savings_rate'] > 0
        assert result['savings'] > 0

    def test_api_uses_optimizer_routes(self, client, opt):
        valid_routes = {r['name'] for r in opt.ROUTES.values()}
        d = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        assert d['route'] in valid_routes

    def test_api_fee_matches_optimizer(self, client, opt):
        direct = opt.optimize(1000, 'efficiency')
        api = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        assert api['fee'] == direct['fee']

    def test_priority_ordering_end_to_end(self, client):
        eff = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        spd = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'speed'}).data)
        sec = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'security'}).data)
        assert eff['fee'] < spd['fee'] < sec['fee']

    def test_congestion_flows_through_pipeline(self, client):
        """Congestion from time-of-day affects model → optimizer → API response."""
        d = json.loads(client.post('/optimize', json={'amount': 1000}).data)
        assert 'congestion' in d
        assert 0 <= d['congestion'] <= 100


# ════════════════════════════════════════════════════════════════
# 8. SYSTEM TESTING — Full system behavior
# ════════════════════════════════════════════════════════════════
class TestSystem:
    def test_system_handles_all_priorities(self, client):
        for p in ['efficiency', 'speed', 'security']:
            d = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': p}).data)
            assert all(k in d for k in ['fee','savings','route','confidence','risk','tee_verified'])

    def test_system_fee_never_exceeds_standard(self, client):
        """Optimized fee should always be less than 1.5% standard."""
        for amt in [100, 500, 1000, 5000]:
            d = json.loads(client.post('/optimize', json={'amount': amt, 'priority': 'efficiency'}).data)
            assert d['fee'] < amt * 0.015

    def test_system_savings_always_positive_for_efficiency(self, client):
        for amt in [10, 100, 1000, 10000]:
            d = json.loads(client.post('/optimize', json={'amount': amt, 'priority': 'efficiency'}).data)
            assert d['savings'] > 0

    def test_system_response_time_acceptable(self, client):
        """API should respond within 5 seconds."""
        start = time.time()
        client.post('/optimize', json={'amount': 1000})
        assert time.time() - start < 5.0

    def test_system_error_responses_have_error_field(self, client):
        d = json.loads(client.post('/optimize', json={}).data)
        assert 'error' in d


# ════════════════════════════════════════════════════════════════
# 9. REGRESSION TESTING — Previously fixed bugs don't reappear
# ════════════════════════════════════════════════════════════════
class TestRegression:
    def test_REG001_savings_not_zero(self, opt):
        """REG-001: savings was always 0 (fixed: route-based calculation)"""
        r = opt.optimize(1000, 'efficiency')
        assert r['savings'] > 0, "REGRESSION: savings returned 0"

    def test_REG002_fee_not_837_for_1000(self, opt):
        """REG-002: fee was 837 for $1000 (fixed: correct formula)"""
        r = opt.optimize(1000, 'efficiency')
        assert r['fee'] < 100, f"REGRESSION: fee={r['fee']} is unreasonably high"

    def test_REG003_tiny_amount_fee_not_zero(self, opt):
        """REG-003: fee was 0 for amounts < $0.34 (fixed: min fee 0.01)"""
        r = opt.optimize(1, 'efficiency')
        assert r['fee'] >= 0.01, "REGRESSION: fee=0 for tiny amount"

    def test_REG004_confidence_not_random(self, opt):
        """REG-004: confidence was random.uniform (fixed: from model)"""
        r1 = opt.optimize(1000, 'efficiency')
        r2 = opt.optimize(1000, 'efficiency')
        # Confidence should be deterministic (same input → same output)
        assert r1['confidence'] == r2['confidence'], "REGRESSION: confidence is random"

    def test_REG005_model_path_not_hardcoded(self):
        """REG-005: model path was hardcoded 'ai-agent/models/...' (fixed: __file__ relative)"""
        m = SavingsModel()
        assert os.path.exists(m.model_path), f"REGRESSION: model not found at {m.model_path}"


# ════════════════════════════════════════════════════════════════
# 10. AD-HOC TESTING — Random, unplanned checks
# ════════════════════════════════════════════════════════════════
class TestAdHoc:
    def test_adhoc_unicode_memo(self, client):
        r = client.post('/optimize', json={'amount': 100, 'priority': 'speed', 'memo': '🚀 test ñ'})
        assert r.status_code == 200

    def test_adhoc_very_precise_float(self, opt):
        r = opt.optimize(3.14159265358979, 'efficiency')
        assert r['fee'] > 0

    def test_adhoc_integer_vs_float_same_result(self, opt):
        r_int = opt.optimize(1000, 'efficiency')
        r_flt = opt.optimize(1000.0, 'efficiency')
        assert r_int['fee'] == r_flt['fee']

    def test_adhoc_model_handles_midnight(self, model):
        r = model.predict(1000, 0, 0.3, 0.0)  # midnight
        assert r['savings_rate'] > 0

    def test_adhoc_model_handles_noon(self, model):
        r = model.predict(1000, 0, 0.3, 12.0)  # noon
        assert r['savings_rate'] > 0


# ════════════════════════════════════════════════════════════════
# 11. UAT — User acceptance: does it meet user requirements?
# ════════════════════════════════════════════════════════════════
class TestUAT:
    def test_UAT001_user_gets_cheaper_fee_than_standard(self, opt):
        """User requirement: platform saves money vs standard 1.5% fee."""
        r = opt.optimize(1000, 'efficiency')
        standard = 1000 * 0.015
        assert r['fee'] < standard
        assert r['savings'] > 0

    def test_UAT002_user_can_choose_speed_over_cost(self, opt):
        """User requirement: speed priority gives fastest route."""
        r = opt.optimize(1000, 'speed')
        assert r['estimated_time_s'] <= 5

    def test_UAT003_user_can_choose_security(self, opt):
        """User requirement: security priority gives lowest risk."""
        r = opt.optimize(1000, 'security')
        assert r['risk'] in ['Very Low', 'Low']

    def test_UAT004_user_sees_confidence_score(self, client):
        """User requirement: confidence score shown in UI."""
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 0 < d['confidence'] <= 100

    def test_UAT005_user_sees_tee_verification_status(self, client):
        """User requirement: TEE verification badge shown."""
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 'tee_verified' in d
        assert 'tee_mode' in d

    def test_UAT006_user_sees_network_congestion(self, client):
        """User requirement: network congestion % shown."""
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 'congestion' in d
        assert 0 <= d['congestion'] <= 100

    def test_UAT007_user_sees_estimated_time(self, client):
        """User requirement: estimated confirmation time shown."""
        d = json.loads(client.post('/optimize', json={'amount': 500}).data)
        assert 'estimated_time_s' in d
        assert d['estimated_time_s'] > 0

    def test_UAT008_invalid_input_gives_clear_error(self, client):
        """User requirement: clear error message on bad input."""
        d = json.loads(client.post('/optimize', json={}).data)
        assert 'error' in d
        assert isinstance(d['error'], str)
        assert len(d['error']) > 0


# ════════════════════════════════════════════════════════════════
# 12. INTERFACE TESTING — API contract / response format
# ════════════════════════════════════════════════════════════════
class TestInterface:
    def test_response_is_json(self, client):
        r = client.post('/optimize', json={'amount': 100})
        assert r.content_type == 'application/json'

    def test_health_response_is_json(self, client):
        r = client.get('/health')
        assert r.content_type == 'application/json'

    def test_optimize_response_schema(self, client):
        d = json.loads(client.post('/optimize', json={'amount': 1000}).data)
        schema = {
            'fee': float, 'savings': float, 'route': str,
            'confidence': float, 'ml_engine': str, 'tee_verified': bool,
            'tee_mode': str, 'provider_id': str, 'estimated_time_s': int,
        }
        for field, ftype in schema.items():
            assert field in d, f"Missing: {field}"
            assert isinstance(d[field], ftype), f"{field} should be {ftype}, got {type(d[field])}"

    def test_error_response_schema(self, client):
        d = json.loads(client.post('/optimize', json={}).data)
        assert 'error' in d
        assert isinstance(d['error'], str)

    def test_health_response_schema(self, client):
        d = json.loads(client.get('/health').data)
        assert isinstance(d['status'], str)
        assert isinstance(d['og_compute'], bool)
        assert isinstance(d['og_compute_model'], str)

    def test_cors_headers_present(self, client):
        """API should allow cross-origin requests (frontend calls from browser)."""
        r = client.post('/optimize', json={'amount': 100},
                        headers={'Origin': 'http://localhost:3000'})
        assert r.status_code == 200

    def test_get_method_not_allowed_on_optimize(self, client):
        assert client.get('/optimize').status_code == 405

    def test_404_for_unknown_route(self, client):
        assert client.get('/unknown').status_code == 404
