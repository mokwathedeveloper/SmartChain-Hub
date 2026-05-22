# Security Policy

## Supported Versions

| Component | Version | Supported |
|---|---|---|
| Frontend (Next.js) | 16.x | ✅ |
| AI Agent (Flask) | 3.0.x | ✅ |
| Smart Contracts (Solidity) | 0.8.20 | ✅ |
| 0G SDK (`@0glabs/0g-ts-sdk`) | Latest | ✅ |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report security issues directly to the maintainer:

| Channel | Contact |
|---|---|
| **Email (preferred)** | [mokwaohuru@gmail.com](mailto:mokwaohuru@gmail.com) |
| **Telegram** | [@MokwaMoffat](https://t.me/MokwaMoffat) |
| **Subject line** | `[SECURITY] SmartChain Hub — <brief description>` |

**Response SLA:**
- Acknowledgement within **24 hours**
- Initial triage within **72 hours**
- Fix or mitigation plan within **7 days** for critical issues

We follow coordinated disclosure. Please allow 90 days before public disclosure to give us time to patch and notify affected users.

---

## Scope

### In Scope

| Target | Description |
|---|---|
| Smart contracts | All 6 contracts on 0G Galileo Testnet / Mainnet |
| Frontend API routes | All 18 Next.js API routes under `/pages/api/` |
| AI agent endpoints | Flask server: `/optimize`, `/fine-tune`, `/health` |
| Authentication | Supabase auth, JWT handling, session management |
| On-chain interactions | ethers.js signer flows, transaction signing |

### Out of Scope

- 0G Network infrastructure itself (report to 0G Labs)
- Supabase platform (report to Supabase)
- Vercel/Render hosting (report to respective platforms)
- Social engineering attacks targeting the team
- Vulnerabilities requiring physical access to infrastructure

---

## Smart Contract Security

### Audit Status

| Contract | Internal Review | External Audit | Status |
|---|---|---|---|
| SmartChainAgentID | ✅ | Rabbit AI (2026) | ✅ All findings resolved |
| SmartChainAgentEscrow | ✅ | Rabbit AI (2026) | ✅ All findings resolved |
| SmartChainPayments | ✅ | Rabbit AI (2026) | ✅ All findings resolved |
| SmartChainRevenue | ✅ | Rabbit AI (2026) | ✅ All findings resolved |
| SmartChainTransaction | ✅ | Rabbit AI (2026) | ✅ All findings resolved |
| SmartChainAgentMarket | ✅ | Internal only | ⏳ External audit pending |

### Resolved Findings (Rabbit AI Audit)

| ID | Severity | Finding | Status |
|---|---|---|---|
| RAB-001 | High | Missing reentrancy guard on `hireAgent()` | ✅ Fixed — `nonReentrant` modifier added |
| RAB-002 | Medium | CEI pattern violation in fee withdrawal | ✅ Fixed — state zeroed before external call |
| RAB-004 | Medium | `renounceOwnership()` locks protocol fees permanently | ✅ Fixed — fee sweep added before owner zeroed |
| RAB-005 | Low | Character-based `toBytes32` can exceed 31 bytes for multibyte UTF-8 chars | ✅ Fixed — byte-aware `TextEncoder` approach |

### Known Limitations

- `SmartChainAgentMarket` has not yet received an external audit. The contract uses the same security patterns as audited contracts, but users should exercise caution with large values until an external audit is completed.
- Contracts are deployed on testnet. Mainnet deployment will be preceded by a full third-party audit.

---

## API Security

### Authentication & Authorization
- All user-specific API routes validate Supabase JWT before returning data
- Supabase Row Level Security (RLS) ensures users can only read/write their own data
- Service role key is **server-side only** — never exposed to the browser

### Rate Limiting
All write-heavy API endpoints are rate-limited to prevent abuse:

| Endpoint | Limit |
|---|---|
| `/api/storage-upload` | 20 requests / minute / IP |
| `/api/ai-optimize` | 30 requests / minute / IP |
| `/api/zk-proof` | 20 requests / minute / IP |
| `/api/fine-tune` | 5 requests / minute / IP |
| `/api/og-da` | 10 requests / minute / IP |

### Input Validation
- All API inputs validated for type and range before processing
- `bytes32` encoding validated client-side with byte-aware truncation
- Transaction amounts validated against minimum thresholds
- Webhook signatures validated (Stripe: `stripe-signature`; Flutterwave: `verif-hash`)

### Secret Management
The following secrets are **never committed to git** and are server-side only:

```
STORAGE_PRIVATE_KEY          — 0G wallet private key (server-side only)
SUPABASE_SERVICE_ROLE_KEY    — Supabase admin key (server-side only)
STRIPE_SECRET_KEY            — Stripe API key
STRIPE_WEBHOOK_SECRET        — Stripe webhook signing secret
FLUTTERWAVE_SECRET_KEY       — Flutterwave API key
FLUTTERWAVE_WEBHOOK_HASH     — Flutterwave webhook hash
PRIVATE_KEY                  — Contract deployer wallet (blockchain .env)
```

Verify no secrets are in git history:
```bash
git log --all --full-history -- "**/.env*"
git grep -r "sk_live\|sk_test\|0x[a-fA-F0-9]\{64\}" -- "*.ts" "*.js" "*.py"
```

### CORS & CSP
- All cross-origin 0G indexer calls are proxied through Next.js API routes (browser never contacts 0G indexer directly)
- Supabase anon key is intentionally public; RLS policies enforce data isolation

---

## Frontend Security

### Dependency Scanning
```bash
# Check for known vulnerabilities
npm audit --audit-level=high

# Check outdated dependencies with known CVEs
npm outdated
```

### XSS Prevention
- All user-generated content rendered via React (auto-escaped)
- No `dangerouslySetInnerHTML` usage
- Content Security Policy headers set via `next.config.ts`

### OWASP Top 10 Coverage

| Risk | Mitigation |
|---|---|
| A01 Broken Access Control | Supabase RLS on all tables |
| A02 Cryptographic Failures | TLS everywhere; no plaintext secrets; SHA-256 ZK commitments |
| A03 Injection | Parameterised Supabase queries; no raw SQL |
| A04 Insecure Design | CEI pattern; reentrancy guards; 2-step ownership |
| A05 Security Misconfiguration | No default credentials; all env vars documented |
| A06 Vulnerable Components | `npm audit` on every deployment |
| A07 Auth Failures | Supabase JWT; RLS per user; no session fixation |
| A08 Data Integrity Failures | Merkle roots committed on-chain; ZK commitments |
| A09 Logging Failures | `secureLogger.ts` — redacts private keys from logs |
| A10 SSRF | AI agent URL validated; no open proxy |

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|---|---|---|
| **Critical** | Funds at risk; active exploitation; key exposure | Immediate (< 1 hour) |
| **High** | Significant data breach; smart contract bug | < 4 hours |
| **Medium** | Degraded service; limited data exposure | < 24 hours |
| **Low** | Minor bug; cosmetic issue | < 7 days |

### Response Playbook

**Critical incident:**
1. Pause affected smart contracts (if `pause()` available)
2. Notify affected users via on-chain event + email
3. Engage external auditor for emergency review
4. Deploy fix + re-audit before re-enabling

**High incident:**
1. Assess scope and blast radius
2. Implement emergency mitigation (rate-limit, disable endpoint)
3. Patch and deploy within 4 hours
4. Post-mortem within 48 hours

---

## Bug Bounty

A formal bug bounty program will be launched alongside mainnet deployment. Interim rewards:

| Severity | Reward |
|---|---|
| Critical (smart contract fund loss) | Up to $10,000 in $SCH (at TGE) |
| High (significant data breach) | Up to $2,500 in $SCH |
| Medium | Up to $500 in $SCH |
| Low | Public acknowledgement in SECURITY.md |

---

## Security Contacts

| Role | Contact |
|---|---|
| Security Lead | Mokwa Moffat · [mokwaohuru@gmail.com](mailto:mokwaohuru@gmail.com) |
| PGP Key | *(available on request)* |

---

*Last updated: May 2026*
