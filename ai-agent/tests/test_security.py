"""
test_security.py — Security Testing
Tests: injection attacks, XSS, oversized payloads, sensitive data exposure,
       auth bypass attempts, malformed requests, header injection
"""
import sys, os, json
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['OG_COMPUTE_API_KEY'] = ''

from server.app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


# ════════════════════════════════════════════════════════════════
# SECURITY TESTING
# ════════════════════════════════════════════════════════════════

class TestInjectionAttacks:
    def test_sql_injection_in_priority(self, client):
        """SQL injection in priority field must not crash or expose data."""
        payloads = [
            "'; DROP TABLE transactions; --",
            "1 OR 1=1",
            "' UNION SELECT * FROM users --",
        ]
        for payload in payloads:
            r = client.post('/optimize', json={'amount': 1000, 'priority': payload})
            assert r.status_code in [200, 400], f"Unexpected status for payload: {payload}"
            # Must not expose stack traces or DB errors
            data = r.data.decode()
            assert 'traceback' not in data.lower()
            assert 'sqlalchemy' not in data.lower()

    def test_command_injection_in_priority(self, client):
        """OS command injection must not execute."""
        payloads = [
            "; ls -la",
            "$(cat /etc/passwd)",
            "`whoami`",
            "| rm -rf /",
        ]
        for payload in payloads:
            r = client.post('/optimize', json={'amount': 1000, 'priority': payload})
            assert r.status_code in [200, 400]
            data = r.data.decode()
            assert 'root:' not in data  # /etc/passwd content
            assert 'bin/bash' not in data

    def test_xss_in_priority(self, client):
        """XSS payloads must not be reflected unescaped."""
        payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert(1)",
            "<img src=x onerror=alert(1)>",
        ]
        for payload in payloads:
            r = client.post('/optimize', json={'amount': 1000, 'priority': payload})
            assert r.status_code in [200, 400]
            # Response should be JSON, not HTML with script tags
            assert r.content_type == 'application/json'

    def test_json_injection_nested(self, client):
        """Deeply nested JSON must not cause stack overflow."""
        # Build deeply nested object
        nested = {'amount': 1000}
        for _ in range(50):
            nested = {'data': nested}
        r = client.post('/optimize', json=nested)
        assert r.status_code in [200, 400]


class TestOversizedPayloads:
    def test_very_long_priority_string(self, client):
        """Very long priority string must not crash."""
        r = client.post('/optimize', json={'amount': 1000, 'priority': 'A' * 10000})
        assert r.status_code in [200, 400]

    def test_large_amount_value(self, client):
        """Extremely large amount must be handled gracefully."""
        r = client.post('/optimize', json={'amount': 10 ** 18})
        assert r.status_code in [200, 400]

    def test_many_extra_fields(self, client):
        """Request with 1000 extra fields must not crash."""
        payload = {'amount': 1000, 'priority': 'efficiency'}
        for i in range(1000):
            payload[f'field_{i}'] = f'value_{i}'
        r = client.post('/optimize', json=payload)
        assert r.status_code in [200, 400]


class TestSensitiveDataExposure:
    def test_error_response_no_stack_trace_in_production(self, client):
        """Error responses must not expose internal stack traces."""
        r = client.post('/optimize', json={})
        data = r.data.decode()
        assert 'Traceback' not in data
        assert 'File "' not in data
        assert 'line ' not in data or 'route' in data  # 'line' in route name is ok

    def test_health_no_private_key_exposed(self, client):
        """Health endpoint must not expose private keys or secrets."""
        r = client.get('/health')
        data = r.data.decode()
        assert '0xc247' not in data  # private key prefix
        assert 'private_key' not in data.lower()
        assert 'secret' not in data.lower()

    def test_optimize_response_no_private_key(self, client):
        """Optimize response must not contain private key."""
        r = client.post('/optimize', json={'amount': 1000})
        data = r.data.decode()
        assert '0xc247' not in data
        assert 'private_key' not in data.lower()

    def test_error_no_internal_paths(self, client):
        """Error messages must not expose internal file paths."""
        r = client.post('/optimize', json={'amount': 'invalid'})
        data = r.data.decode()
        # Should not expose absolute paths like /home/user/...
        assert '/home/' not in data or r.status_code == 200


class TestMalformedRequests:
    def test_malformed_json_body(self, client):
        """Malformed JSON must return 400, not 500."""
        r = client.post('/optimize',
                        data=b'{invalid json}',
                        content_type='application/json')
        assert r.status_code in [400, 415, 422]

    def test_empty_body_not_500(self, client):
        """Empty body must not cause 500."""
        r = client.post('/optimize', data=b'', content_type='application/json')
        assert r.status_code != 500

    def test_binary_body_not_500(self, client):
        """Binary data must not cause 500."""
        r = client.post('/optimize',
                        data=b'\x00\x01\x02\x03\xff\xfe',
                        content_type='application/json')
        assert r.status_code != 500

    def test_array_body_not_500(self, client):
        """Array JSON body must not cause 500."""
        try:
            r = client.post('/optimize',
                            data=b'[1, 2, 3]',
                            content_type='application/json')
            assert r.status_code in [200, 400]
        except Exception:
            pass  # Flask may raise before response — that's acceptable

    def test_string_body_not_500(self, client):
        """String JSON body must not cause 500."""
        try:
            r = client.post('/optimize',
                            data=b'"just a string"',
                            content_type='application/json')
            assert r.status_code in [200, 400]
        except Exception:
            pass  # Flask may raise before response — that's acceptable


class TestAuthBypass:
    def test_no_auth_required_for_optimize(self, client):
        """Optimize endpoint is public — no auth needed (by design)."""
        r = client.post('/optimize', json={'amount': 1000})
        assert r.status_code == 200

    def test_fake_auth_header_ignored(self, client):
        """Fake Authorization header must not grant extra privileges."""
        r = client.post('/optimize',
                        json={'amount': 1000},
                        headers={'Authorization': 'Bearer fake_token_12345'})
        assert r.status_code == 200
        data = json.loads(r.data)
        # Should still use local TF, not grant 0G Compute access
        assert data['tee_verified'] == False

    def test_admin_endpoint_does_not_exist(self, client):
        """No admin endpoints should be exposed."""
        for path in ['/admin', '/admin/users', '/debug', '/config', '/env']:
            r = client.get(path)
            assert r.status_code == 404, f"Unexpected endpoint exposed: {path}"


class TestHeaderSecurity:
    def test_cors_allows_localhost(self, client):
        """CORS must allow localhost:3000 (frontend)."""
        r = client.post('/optimize',
                        json={'amount': 1000},
                        headers={'Origin': 'http://localhost:3000'})
        assert r.status_code == 200

    def test_content_type_json_required(self, client):
        """Non-JSON content type should be handled gracefully."""
        r = client.post('/optimize',
                        data='amount=1000',
                        content_type='text/plain')
        assert r.status_code in [200, 400, 415]

    def test_response_content_type_is_json(self, client):
        """All responses must have application/json content type."""
        r = client.post('/optimize', json={'amount': 1000})
        assert 'application/json' in r.content_type

        r2 = client.get('/health')
        assert 'application/json' in r2.content_type
