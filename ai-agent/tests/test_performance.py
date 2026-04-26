"""
test_performance.py — Performance Testing
Tests: response time, throughput, load, concurrent requests, memory stability

Performance requirements:
  - Single optimize call < 5s
  - 10 concurrent calls all succeed
  - 100 sequential calls complete in < 60s
  - Response size < 2KB
"""
import sys, os, json, time, threading
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


# ════════════════════════════════════════════════════════════════
# PERFORMANCE TESTING — Response time, throughput, load
# ════════════════════════════════════════════════════════════════

class TestResponseTime:
    def test_single_optimize_under_5s(self, client):
        """Single /optimize call must complete within 5 seconds."""
        start = time.time()
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
        elapsed = time.time() - start
        assert r.status_code == 200
        assert elapsed < 5.0, f"Response took {elapsed:.2f}s — exceeds 5s SLA"

    def test_health_under_1s(self, client):
        """Health check must respond within 1 second."""
        start = time.time()
        r = client.get('/health')
        elapsed = time.time() - start
        assert r.status_code == 200
        assert elapsed < 1.0, f"Health check took {elapsed:.2f}s"

    def test_all_priorities_under_5s(self, client):
        """All 3 priorities must respond within 5 seconds each."""
        for priority in ['efficiency', 'speed', 'security']:
            start = time.time()
            r = client.post('/optimize', json={'amount': 1000, 'priority': priority})
            elapsed = time.time() - start
            assert r.status_code == 200
            assert elapsed < 5.0, f"Priority={priority} took {elapsed:.2f}s"

    def test_optimizer_direct_under_2s(self):
        """Direct optimizer call (no HTTP) must complete within 2 seconds."""
        opt = TransactionOptimizer()
        start = time.time()
        opt.optimize(1000, 'efficiency')
        elapsed = time.time() - start
        assert elapsed < 2.0, f"Optimizer took {elapsed:.2f}s"

    def test_model_predict_under_1s(self):
        """Model prediction must complete within 1 second."""
        model = SavingsModel()
        start = time.time()
        model.predict(1000, 0, 0.3, 12.0)
        elapsed = time.time() - start
        assert elapsed < 1.0, f"Model predict took {elapsed:.2f}s"


class TestThroughput:
    def test_10_sequential_calls_under_30s(self, client):
        """10 sequential optimize calls must complete within 30 seconds."""
        start = time.time()
        for i in range(10):
            r = client.post('/optimize', json={'amount': 100 * (i + 1), 'priority': 'efficiency'})
            assert r.status_code == 200
        elapsed = time.time() - start
        assert elapsed < 30.0, f"10 calls took {elapsed:.2f}s"

    def test_average_response_time_under_3s(self, client):
        """Average response time over 5 calls must be under 3 seconds."""
        times = []
        for _ in range(5):
            start = time.time()
            client.post('/optimize', json={'amount': 500, 'priority': 'speed'})
            times.append(time.time() - start)
        avg = sum(times) / len(times)
        assert avg < 3.0, f"Average response time {avg:.2f}s exceeds 3s"

    def test_response_size_under_2kb(self, client):
        """Response payload must be under 2KB."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'efficiency'})
        size = len(r.data)
        assert size < 2048, f"Response size {size} bytes exceeds 2KB"


class TestConcurrency:
    def test_10_concurrent_requests_all_succeed(self):
        """10 concurrent requests must all return 200."""
        import threading
        results = []
        errors = []

        def make_request(amount):
            try:
                # Each thread gets its own test client
                with app.test_client() as c:
                    r = c.post('/optimize', json={'amount': amount, 'priority': 'efficiency'})
                    results.append(r.status_code)
            except Exception as e:
                errors.append(str(e))

        threads = [threading.Thread(target=make_request, args=(100 * (i + 1),)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=15)

        assert len(errors) == 0, f"Errors in concurrent requests: {errors}"
        assert all(s == 200 for s in results), f"Not all 200: {results}"
        assert len(results) == 10

    def test_concurrent_different_priorities(self):
        """Concurrent requests with different priorities all succeed."""
        import threading
        results = []
        priorities = ['efficiency', 'speed', 'security'] * 3

        def make_request(priority):
            with app.test_client() as c:
                r = c.post('/optimize', json={'amount': 1000, 'priority': priority})
                results.append(r.status_code)

        threads = [threading.Thread(target=make_request, args=(p,)) for p in priorities]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=15)

        assert all(s == 200 for s in results)


class TestLoadStability:
    def test_model_stable_under_load(self):
        """Model produces consistent results under repeated calls."""
        model = SavingsModel()
        baseline = model.predict(1000, 0, 0.3, 12.0)
        for _ in range(20):
            r = model.predict(1000, 0, 0.3, 12.0)
            assert r['savings_rate'] == baseline['savings_rate'], "Model output changed under load"
            assert r['confidence'] == baseline['confidence']

    def test_optimizer_stable_under_load(self):
        """Optimizer produces consistent results under repeated calls."""
        opt = TransactionOptimizer()
        baseline = opt.optimize(1000, 'efficiency')
        for _ in range(20):
            r = opt.optimize(1000, 'efficiency')
            assert r['fee'] == baseline['fee'], "Fee changed under load"
            assert r['route'] == baseline['route'], "Route changed under load"

    def test_no_memory_leak_100_calls(self, client):
        """100 calls should not crash or degrade — basic memory stability."""
        for i in range(100):
            r = client.post('/optimize', json={'amount': 10 + i, 'priority': 'efficiency'})
            assert r.status_code == 200, f"Failed on call {i}"
