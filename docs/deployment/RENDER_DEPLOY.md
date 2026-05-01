<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🚀 Render Deployment — SmartChain AI Agent
### *Flask · TensorFlow 2.16 · 0G Compute TeeML · Gunicorn*

[![Render](https://img.shields.io/badge/Platform-Render-46E3B7?style=for-the-badge)](https://render.com)
[![Live](https://img.shields.io/badge/Live-smartchain--hub.onrender.com-10b981?style=for-the-badge)](https://smartchain-hub.onrender.com)

</div>

---

## Step 1 — Create Web Service

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your `SmartChain-Hub` GitHub repository
3. Configure as below

---

## Step 2 — Service Configuration

| Field | Value |
|---|---|
| **Name** | `smartchain-ai-agent` |
| **Root Directory** | `ai-agent` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 server.app:app` |
| **Plan** | Free (512MB RAM — TF lazy-loaded to avoid OOM) |
| **Auto-Deploy** | Yes — on every push to `main` |

---

## Step 3 — Environment Variables

Set these in the Render dashboard under **Environment**:

| Key | Value | Required |
|---|---|---|
| `OG_COMPUTE_PRIVATE_KEY` | `0x...` funded wallet key | For 0G Compute TeeML |
| `STORAGE_PRIVATE_KEY` | `0x...` funded wallet key | For 0G Storage fine-tune |
| `OG_COMPUTE_BROKER_URL` | `https://broker.0g.ai` | ✅ |
| `OG_COMPUTE_MODEL` | `llama-3.1-8b-instruct` | ✅ |
| `OG_COMPUTE_RPC` | `https://evmrpc-testnet.0g.ai` | ✅ |
| `PORT` | `10000` | Auto-set by Render |
| `FLASK_ENV` | `production` | ✅ |

> Without `OG_COMPUTE_PRIVATE_KEY` the service still works — falls back to local TensorFlow 2.16.

---

## Step 4 — Deploy & Verify

Click **Create Web Service**. Build takes ~3–5 minutes (TF CPU install).

```bash
# Verify health
curl https://smartchain-ai-agent.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "agent": "SmartChain AI v1.0",
  "og_compute": true,
  "og_compute_model": "llama-3.1-8b-instruct",
  "og_compute_rpc": "https://evmrpc-testnet.0g.ai"
}
```

```bash
# Test optimization
curl -X POST https://smartchain-ai-agent.onrender.com/optimize \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "priority": "efficiency"}'
```

---

## Step 5 — Connect Frontend

Update Vercel environment variable:

```bash
# Vercel CLI
vercel env add NEXT_PUBLIC_AI_AGENT_URL production
# value: https://smartchain-ai-agent.onrender.com
vercel --prod
```

Or set directly in the Vercel dashboard under **Settings → Environment Variables**.

---

## Render-Specific Notes

```
Free tier cold starts:
  First request after 15min inactivity takes ~30s
  TensorFlow lazy-loads on first /optimize request
  Subsequent requests are fast (~200ms)

Memory:
  TF CPU 2.16 uses ~300MB peak
  Render free tier = 512MB — fits with lazy loading
  Do NOT import TF at module level (causes OOM crash)

Logs:
  View in Render dashboard → Logs tab
  Filter by: ERROR, WARNING, INFO
```

---

## render.yaml Reference

```yaml
# ai-agent/render.yaml
services:
  - type: web
    name: smartchain-ai-agent
    runtime: python
    rootDir: ai-agent
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 server.app:app
    envVars:
      - key: FLASK_ENV
        value: production
      - key: OG_COMPUTE_BROKER_URL
        value: https://broker.0g.ai
      - key: OG_COMPUTE_MODEL
        value: llama-3.1-8b-instruct
      - key: OG_COMPUTE_RPC
        value: https://evmrpc-testnet.0g.ai
      - key: OG_COMPUTE_PRIVATE_KEY
        sync: false   # set manually in dashboard
      - key: STORAGE_PRIVATE_KEY
        sync: false   # set manually in dashboard
```

---

<div align="center">

**SmartChain AI Agent** · Deployed on Render · 0G APAC Hackathon 2026

`#BuildOn0G` · `#AgenticEconomy`

</div>
