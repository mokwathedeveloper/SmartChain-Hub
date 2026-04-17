"""
test_api.py — Tests for the Flask AI agent API endpoints
"""
import sys, os, json
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['OG_COMPUTE_API_KEY'] = ''  # force local TF fallback

from server.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c

# ── /health ──────────────────────────────────────────────────────
def test_health_returns_200(client):
    r = client.get('/health')
    assert r.status_code == 200

def test_health_returns_healthy(client):
    data = json.loads(r := client.get('/health').data)
    assert data['status'] == 'healthy'

def test_health_shows_og_compute_status(client):
    data = json.loads(client.get('/health').data)
    assert 'og_compute' in data

# ── /optimize ────────────────────────────────────────────────────
def test_optimize_returns_200(client):
    r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
    assert r.status_code == 200

def test_optimize_returns_required_fields(client):
    r = client.post('/optimize', json={'amount': 500, 'priority': 'speed'})
    data = json.loads(r.data)
    for field in ['fee', 'savings', 'route', 'confidence', 'ml_engine', 'tee_verified']:
        assert field in data, f"Missing field: {field}"

def test_optimize_fee_is_positive(client):
    r = client.post('/optimize', json={'amount': 1000})
    assert json.loads(r.data)['fee'] > 0

def test_optimize_savings_non_negative(client):
    r = client.post('/optimize', json={'amount': 1000})
    assert json.loads(r.data)['savings'] >= 0

def test_optimize_confidence_in_range(client):
    r = client.post('/optimize', json={'amount': 1000, 'priority': 'security'})
    conf = json.loads(r.data)['confidence']
    assert 0 < conf <= 100

def test_optimize_tee_false_without_api_key(client):
    r = client.post('/optimize', json={'amount': 1000})
    assert json.loads(r.data)['tee_verified'] == False

def test_optimize_missing_amount_returns_400(client):
    r = client.post('/optimize', json={'priority': 'speed'})
    assert r.status_code == 400

def test_optimize_invalid_amount_returns_400(client):
    r = client.post('/optimize', json={'amount': 'not_a_number'})
    assert r.status_code == 400

def test_optimize_all_priorities(client):
    for priority in ['efficiency', 'speed', 'security']:
        r = client.post('/optimize', json={'amount': 1000, 'priority': priority})
        assert r.status_code == 200, f"Failed for priority={priority}"

def test_optimize_large_amount(client):
    r = client.post('/optimize', json={'amount': 50000, 'priority': 'efficiency'})
    data = json.loads(r.data)
    assert data['fee'] > 0
    assert data['savings'] >= 0

def test_optimize_small_amount(client):
    r = client.post('/optimize', json={'amount': 5, 'priority': 'efficiency'})
    assert r.status_code == 200
