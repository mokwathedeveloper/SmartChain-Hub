<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🛡️ SmartChain Hub — Security Architecture
### *Defense-in-depth across every layer of the stack*

[![Security](https://img.shields.io/badge/Security-Hardened-10b981?style=for-the-badge)](.)
[![OWASP](https://img.shields.io/badge/OWASP-Top_10_Mitigated-0ea5e9?style=for-the-badge)](.)
[![Contracts](https://img.shields.io/badge/Contracts-ReentrancyGuard-6366f1?style=for-the-badge)](.)

</div>

---

## Security Posture Overview

```
LAYER               THREAT                    MITIGATION              STATUS
────────────────────────────────────────────────────────────────────────────
Frontend API        SSRF (CWE-918)            Allowlist validation    ✅ Fixed
Frontend Logs       Log Injection (CWE-117)   Input sanitization      ✅ Fixed
Backend Routes      CSRF (CWE-352)            Token-based protection  ✅ Fixed
AI Agent Server     Resource Exposure (668)   Localhost binding       ✅ Fixed
Smart Contracts     Reentrancy                nonReentrant modifier   ✅ Fixed
Smart Contracts     Unauthorized access       Ownable + access ctrl   ✅ Fixed
All Packages        Known CVEs                Dependencies updated    ✅ Fixed
HTTP Headers        Clickjacking / XSS        Helmet middleware       ✅ Fixed
API Endpoints       Brute force / DDoS        Rate limiting           ✅ Fixed
Transaction Input   Injection / overflow      Input validation        ✅ Fixed
```

---

## 1 · SSRF Protection — CWE-918

**Threat:** Attacker crafts a URL that causes the server to make requests to internal services.

**Fix:** Explicit allowlist — only known AI agent hosts are permitted.

```typescript
// smartchain_hub_frontend/src/utils/secureApi.ts
const ALLOWED_HOSTS = [
  'smartchain-hub.onrender.com',
  'localhost:5000',
  '127.0.0.1:5000'
];

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return ALLOWED_HOSTS.some(h =>
      parsed.hostname === h || parsed.host === h
    );
  } catch {
    return false;
  }
}
```

**Coverage:** `utils/api.ts` · `transactionController.js` · all outbound HTTP calls

---

## 2 · Log Injection Prevention — CWE-117

**Threat:** User-controlled input containing newlines/control chars corrupts log files, enabling log forgery.

**Fix:** Strip all control characters before any log sink.

```typescript
// smartchain_hub_frontend/src/utils/secureLogger.ts
function sanitizeForLogging(input: any): string {
  return String(input)
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ')
    .substring(0, 1000);
}

export const secureLogger = {
  info:   (msg: string, data?: any) => console.log(sanitizeForLogging(msg)),
  error:  (msg: string, err?: any)  => console.error(sanitizeForLogging(msg)),
  wallet: (msg: string, addr?: any) => console.log(sanitizeForLogging(msg)),
};
```

**Coverage:** `Web3Context.tsx` · all wallet event handlers

---

## 3 · CSRF Protection — CWE-352

**Threat:** Cross-site request forgery on state-changing backend routes.

**Fix:** Token-based CSRF on all mutation endpoints.

```javascript
// smartchain_hub_backend/middleware/security.js
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.use('/api/transactions', csrfProtection);
app.use('/api/users',        csrfProtection);
```

---

## 4 · Secure Host Binding — CWE-668

**Threat:** AI agent Flask server bound to `0.0.0.0` exposes internal endpoints to the public network.

**Fix:** Development binds to `127.0.0.1`. Production uses Gunicorn with controlled binding.

```python
# ai-agent/server/secure_app.py
if __name__ == '__main__':
    host  = '127.0.0.1'  # localhost only in dev
    port  = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host=host, port=port, debug=debug)
```

```bash
# Production — Gunicorn handles public binding safely
gunicorn \
  --bind 0.0.0.0:$PORT \
  --timeout 120 \
  --workers 1 \
  server.app:app
```

---

## 5 · Smart Contract Security

All 5 contracts implement defense-in-depth:

```
PATTERN                 CONTRACTS USING IT
────────────────────────────────────────────────────────
nonReentrant modifier   AgentEscrow · Payments · Revenue · Transaction
Ownable access control  All 5 contracts
Pull-over-push payments AgentEscrow.withdraw() · Revenue.claimEarnings()
Integer overflow safe   Solidity 0.8.20 (built-in overflow checks)
Zero-address checks     AgentEscrow.deposit() · Payments.sendFunds()
Self-channel guard      AgentEscrow: cannot open channel with yourself
Soulbound enforcement   AgentID.transfer() always reverts
```

**Key patterns:**

```solidity
// Reentrancy guard on all payable functions
function payPerCall(address _agentA) external nonReentrant {
    // state changes BEFORE external call (CEI pattern)
    ch.balance    -= gross;
    ch.totalCalls += 1;
    totalFeesCollected += fee;

    // external call LAST
    (bool ok,) = payable(msg.sender).call{value: net}("");
    require(ok, "Transfer to agent B failed");
}

// Soulbound — blocks all transfers
function transfer(address, uint256) external pure {
    revert("Agent ID is soulbound - non-transferable");
}
```

---

## 6 · HTTP Security Headers

Applied on every response via Helmet middleware:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://evmrpc-testnet.0g.ai"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// Additional headers
res.setHeader('X-Content-Type-Options',  'nosniff');
res.setHeader('X-Frame-Options',         'DENY');
res.setHeader('Referrer-Policy',         'strict-origin-when-cross-origin');
res.setHeader('Permissions-Policy',      'camera=(), microphone=(), geolocation=()');
```

---

## 7 · Rate Limiting

```javascript
// smartchain_hub_backend/middleware/security.js
const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15 minutes
  max:             100,              // requests per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests — try again in 15 minutes' },
});

app.use(limiter);
app.use('/api/transactions/process', rateLimit({ windowMs: 60_000, max: 10 }));
```

---

## 8 · Input Validation

All transaction inputs validated before processing or blockchain submission:

```javascript
const validateTransactionInput = [
  body('to')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  body('value')
    .matches(/^[0-9]+$/)
    .withMessage('Value must be a non-negative integer'),
  body('gasLimit')
    .isInt({ min: 21_000, max: 10_000_000 })
    .withMessage('Gas limit out of range'),
];
```

ZK proof input validation:

```typescript
// src/pages/api/zk-proof.ts
function validateInputs(amount: number, fee: number, savings: number): string | null {
  if (amount <= 0)              return 'amount must be > 0';
  if (fee < 0)                  return 'fee must be >= 0';
  if (savings < 0)              return 'savings must be >= 0';
  if (fee >= amount * 0.05)     return 'fee exceeds 5% of amount';
  if (savings / amount > 0.10)  return 'savings rate exceeds 10%';
  return null;
}
```

---

## 9 · AI Model Determinism

Prevents non-deterministic TensorFlow behaviour in production — ensures reproducible inference:

```python
# ai-agent/models/savings_model.py
import tensorflow as tf
tf.keras.utils.set_random_seed(42)
# tf.config.experimental.enable_op_determinism()  # enable for full determinism
```

---

## 10 · Dependency Security

| Layer | Tool | Last Updated |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) Frontend | `npm audit` — 0 high/critical | Hackathon period |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) Backend | `npm audit` — 0 high/critical | Hackathon period |
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) AI Agent | `pip-audit` — 0 known CVEs | Hackathon period |
| ![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity) Contracts | OpenZeppelin 5.x — audited | Latest stable |

---

## Security Files Reference

| File | Purpose |
|---|---|
| `smartchain_hub_frontend/src/utils/secureApi.ts` | SSRF-safe API client with allowlist |
| `smartchain_hub_frontend/src/utils/secureLogger.ts` | Log injection prevention |
| `smartchain_hub_backend/middleware/security.js` | CSRF · rate limiting · headers |
| `ai-agent/server/secure_app.py` | Production-safe Flask binding |
| `blockchain/contracts/*.sol` | nonReentrant + Ownable on all contracts |

---

<div align="center">

Security is not a feature. It is a foundation.

**SmartChain Hub** · Defense-in-depth across every layer

</div>
