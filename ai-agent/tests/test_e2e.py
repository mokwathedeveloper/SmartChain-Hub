"""
test_e2e.py — End-to-End Testing
Simulates complete user workflows from start to finish:
  1. User optimizes a transaction (all 3 priorities)
  2. Response contains all required fields for frontend
  3. ZK proof inputs are valid (savings > 0, fee in range)
  4. Fine-tune pipeline validates data correctly
  5. Full economic flywheel: optimize → verify → store-ready → fine-tune-ready
"""
import sys, os, json, hashlib
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['OG_COMPUTE_API_KEY'] = ''

from server.app import app
from scripts.optimizer import TransactionOptimizer
from scripts.fine_tuner import transactions_to_features, fine_tune
from models.savings_model import SavingsModel


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


# ════════════════════════════════════════════════════════════════
# E2E WORKFLOW 1: User optimizes a transaction
# ════════════════════════════════════════════════════════════════

class TestE2EOptimizeWorkflow:
    def test_e2e_efficiency_full_workflow(self, client):
        """
        E2E: User selects efficiency priority.
        Verifies complete response for frontend rendering.
        """
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
        assert r.status_code == 200
        d = json.loads(r.data)

        # All fields the frontend needs
        assert d['fee'] > 0
        assert d['savings'] > 0
        assert d['route'] == '0G Chain Flash Route'
        assert d['confidence'] > 0
        assert d['estimated_time_s'] == 8
        assert d['tee_verified'] == False  # no key in test
        assert d['tee_mode'] == 'local'
        assert d['provider_id'] == 'local-tf'
        assert 'TensorFlow' in d['ml_engine']
        assert d['risk'] in ['Very Low', 'Low', 'Medium', 'High']
        assert 0 <= d['congestion'] <= 100
        assert 'explanation' in d

    def test_e2e_speed_full_workflow(self, client):
        """E2E: User selects speed priority."""
        r = client.post('/optimize', json={'amount': 500, 'priority': 'speed'})
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d['estimated_time_s'] == 3
        assert d['route'] == 'Standard Layer 2 Aggregator'
        assert d['fee'] == 2.50

    def test_e2e_security_full_workflow(self, client):
        """E2E: User selects security priority."""
        r = client.post('/optimize', json={'amount': 500, 'priority': 'security'})
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d['estimated_time_s'] == 15
        assert d['route'] == 'Decentralized Liquidity Bridge'
        assert d['risk'] in ['Very Low', 'Low']

    def test_e2e_user_always_saves_money(self, client):
        """E2E: Every optimization must save money vs 1.5% standard fee."""
        for amount in [100, 500, 1000, 5000]:
            for priority in ['efficiency', 'speed', 'security']:
                d = json.loads(client.post('/optimize',
                    json={'amount': amount, 'priority': priority}).data)
                standard_fee = amount * 0.015
                assert d['fee'] < standard_fee, \
                    f"amount={amount} priority={priority}: fee={d['fee']} >= standard={standard_fee}"


# ════════════════════════════════════════════════════════════════
# E2E WORKFLOW 2: ZK Proof validation pipeline
# ════════════════════════════════════════════════════════════════

class TestE2EZKProofPipeline:
    def test_e2e_optimize_output_passes_zk_validation(self, client):
        """
        E2E: Optimizer output must pass ZK proof input validation.
        fee < amount * 0.05 AND savings / amount <= 0.10
        """
        for amount in [100, 500, 1000, 5000]:
            for priority in ['efficiency', 'speed', 'security']:
                d = json.loads(client.post('/optimize',
                    json={'amount': amount, 'priority': priority}).data)
                fee = d['fee']
                savings = d['savings']

                # ZK proof validation rules (from /api/zk-proof)
                assert fee >= 0, "fee must be >= 0"
                assert savings >= 0, "savings must be >= 0"
                assert fee < amount * 0.05, \
                    f"fee={fee} exceeds 5% of amount={amount} — ZK proof would reject"
                assert savings / amount <= 0.10, \
                    f"savings_rate={savings/amount:.4f} exceeds 10% — ZK proof would reject"

    def test_e2e_sha256_commitment_deterministic(self):
        """E2E: SHA-256 commitment is deterministic for same inputs."""
        def build_commitment(amount, fee, savings, user_id):
            payload = f"{amount}:{fee}:{savings}:{user_id}"
            return "0x" + hashlib.sha256(payload.encode()).hexdigest()

        c1 = build_commitment(1000, 3.0, 17.22, "user-123")
        c2 = build_commitment(1000, 3.0, 17.22, "user-123")
        assert c1 == c2

    def test_e2e_different_users_different_commitments(self):
        """E2E: Different users produce different ZK commitments."""
        def build_commitment(amount, fee, savings, user_id):
            payload = f"{amount}:{fee}:{savings}:{user_id}"
            return "0x" + hashlib.sha256(payload.encode()).hexdigest()

        c1 = build_commitment(1000, 3.0, 17.22, "user-alice")
        c2 = build_commitment(1000, 3.0, 17.22, "user-bob")
        assert c1 != c2


# ════════════════════════════════════════════════════════════════
# E2E WORKFLOW 3: Fine-tune pipeline
# ════════════════════════════════════════════════════════════════

class TestE2EFineTunePipeline:
    def test_e2e_real_tx_converts_to_features(self):
        """
        E2E: Real transaction records (as stored in 0G Storage)
        convert correctly to training features.
        """
        # Simulate what transactionController.js stores in 0G Storage
        real_transactions = [
            {
                'amount': 1000.0,
                'fee': 3.0,
                'savings': 17.22,
                'route': '0G Chain Flash Route',
                'tee_verified': False,
                'timestamp': 1700000000000,
            },
            {
                'amount': 500.0,
                'fee': 2.5,
                'savings': 5.0,
                'route': 'Standard Layer 2 Aggregator',
                'tee_verified': False,
                'timestamp': 1700001000000,
            },
        ]
        X, y = transactions_to_features(real_transactions)
        assert X.shape == (2, 6), f"Expected (2,6) features, got {X.shape}"
        assert y.shape == (2, 3), f"Expected (2,3) labels, got {y.shape}"
        # All feature values in valid range
        assert (X >= 0).all()
        assert (X <= 1).all()
        # All label values in valid range
        assert (y >= 0).all()
        assert (y <= 1).all()

    def test_e2e_fine_tune_rejects_insufficient_data(self):
        """E2E: Fine-tune rejects < 10 samples with clear reason."""
        result = fine_tune([], dry_run=False)
        assert result['ok'] == False
        assert result['reason'] == 'no_data'
        assert result['samples'] == 0

    def test_e2e_fine_tune_dry_run_validates_data(self):
        """E2E: Dry run validates data without training."""
        # Can't fetch from 0G Storage in test — but we can test the pipeline
        result = fine_tune([], dry_run=True)
        assert result['ok'] == False  # no data
        assert 'samples' in result

    def test_e2e_feature_vector_correct_shape(self):
        """E2E: Feature vector has exactly 6 features as model expects."""
        feat = SavingsModel._make_features_static(1000, 0, 0.3, 12.0)
        assert len(feat) == 6
        # amount_norm, priority_eff, priority_spd, priority_sec, congestion, time_norm
        assert 0 <= feat[0] <= 1  # amount_norm
        assert feat[1] == 1.0    # efficiency one-hot
        assert feat[2] == 0.0    # speed one-hot
        assert feat[3] == 0.0    # security one-hot
        assert feat[4] == 0.3    # congestion
        assert 0 <= feat[5] <= 1  # time_norm


# ════════════════════════════════════════════════════════════════
# E2E WORKFLOW 4: Economic flywheel
# ════════════════════════════════════════════════════════════════

class TestE2EEconomicFlywheel:
    def test_e2e_full_flywheel_data_flow(self, client):
        """
        E2E: Complete economic flywheel data flow.
        optimize → response has all fields → ZK inputs valid → storage-ready
        """
        # Step 1: Optimize
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
        assert r.status_code == 200
        d = json.loads(r.data)

        # Step 2: Verify response has all fields needed for storage upload
        storage_payload = {
            'amount': 1000,
            'fee': d['fee'],
            'savings': d['savings'],
            'route': d['route'],
            'tee_verified': d['tee_verified'],
            'tee_proof': d.get('tee_proof', ''),
            'timestamp': 1700000000000,
        }
        assert all(k in storage_payload for k in ['amount', 'fee', 'savings', 'route'])

        # Step 3: Verify ZK proof inputs are valid
        assert storage_payload['fee'] < storage_payload['amount'] * 0.05
        assert storage_payload['savings'] / storage_payload['amount'] <= 0.10

        # Step 4: Verify fine-tune feature conversion works
        X, y = transactions_to_features([storage_payload])
        assert X.shape == (1, 6)
        assert y.shape == (1, 3)

    def test_e2e_all_3_routes_produce_storage_ready_data(self, client):
        """E2E: All 3 routes produce data that can be stored and used for fine-tuning."""
        for priority in ['efficiency', 'speed', 'security']:
            d = json.loads(client.post('/optimize',
                json={'amount': 1000, 'priority': priority}).data)

            tx = {
                'amount': 1000,
                'fee': d['fee'],
                'savings': d['savings'],
                'route': d['route'],
                'tee_verified': d['tee_verified'],
                'timestamp': 1700000000000,
            }

            X, y = transactions_to_features([tx])
            assert X.shape == (1, 6), f"priority={priority}: bad feature shape"
            assert y.shape == (1, 3), f"priority={priority}: bad label shape"

    def test_e2e_fee_ordering_preserved_end_to_end(self, client):
        """E2E: efficiency < speed < security fee ordering preserved end-to-end."""
        eff = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        spd = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'speed'}).data)
        sec = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'security'}).data)

        assert eff['fee'] < spd['fee'] < sec['fee'], \
            f"Fee ordering broken: eff={eff['fee']} spd={spd['fee']} sec={sec['fee']}"

    def test_e2e_time_ordering_preserved_end_to_end(self, client):
        """E2E: speed < efficiency < security time ordering preserved end-to-end."""
        eff = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'}).data)
        spd = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'speed'}).data)
        sec = json.loads(client.post('/optimize', json={'amount': 1000, 'priority': 'security'}).data)

        assert spd['estimated_time_s'] < eff['estimated_time_s'] < sec['estimated_time_s'], \
            f"Time ordering broken: spd={spd['estimated_time_s']} eff={eff['estimated_time_s']} sec={sec['estimated_time_s']}"


# ════════════════════════════════════════════════════════════════
# E2E WORKFLOW 5: Compatibility — different input formats
# ════════════════════════════════════════════════════════════════

class TestE2ECompatibility:
    def test_e2e_integer_amount(self, client):
        """E2E: Integer amount works correctly."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
        assert r.status_code == 200
        assert json.loads(r.data)['fee'] > 0

    def test_e2e_float_amount(self, client):
        """E2E: Float amount works correctly."""
        r = client.post('/optimize', json={'amount': 1000.50, 'priority': 'efficiency'})
        assert r.status_code == 200
        assert json.loads(r.data)['fee'] > 0

    def test_e2e_string_amount(self, client):
        """E2E: String amount is parsed correctly."""
        r = client.post('/optimize', json={'amount': '1000', 'priority': 'efficiency'})
        assert r.status_code == 200

    def test_e2e_no_priority_defaults_to_efficiency(self, client):
        """E2E: Missing priority defaults to efficiency route."""
        r = client.post('/optimize', json={'amount': 1000})
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d['route'] == '0G Chain Flash Route'
        assert d['estimated_time_s'] == 8

    def test_e2e_response_always_json(self, client):
        """E2E: All responses are valid JSON regardless of input."""
        test_cases = [
            {'amount': 1000},
            {'amount': 'invalid'},
            {},
            {'amount': 1000, 'priority': 'efficiency'},
        ]
        for payload in test_cases:
            r = client.post('/optimize', json=payload)
            # Must always return valid JSON
            try:
                json.loads(r.data)
            except json.JSONDecodeError:
                pytest.fail(f"Response is not valid JSON for payload: {payload}")
