<div align="center">

# 🤖 SmartChain AI Agent — Cloud Deployment
### *Flask · TensorFlow 2.16 · 0G Compute TeeML · Gunicorn*

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow_CPU-2.16.2-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Render](https://img.shields.io/badge/Live_on-Render-46E3B7?style=flat-square)](https://smartchain-hub.onrender.com)

</div>

---

## What This Service Does

```
POST /optimize
  ├── Try 0G Compute TeeML broker (LLaMA 3.1 8B)
  │     └── X-TEE-Proof header in response
  └── Fallback: TensorFlow 2.16 local model
        └── 6-feature neural network
              savings_rate · confidence · risk_score

POST /fine-tune
  ├── Fetch tx receipts from 0G Storage by rootHash
  ├── Convert to 6-feature training vectors
  ├── model.fit(X, y, epochs=50, lr=0.0001)
  └── Return new model_hash (SHA-256 of weights)

GET /health
  └── { status, og_compute, og_compute_model }
```

---

## Deployment Options

### Option A — Render (Recommended)

```bash
# render.yaml is pre-configured
git push origin main
# Connect repo in Render dashboard
# Root directory: ai-agent/
# Build: pip install -r requirements.txt
# Start: gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 server.app:app
```

Set environment variables in Render dashboard:
```env
OG_COMPUTE_PRIVATE_KEY=0x...
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
```

### Option B — Railway

```bash
cd ai-agent
railway login
railway up
railway variables set OG_COMPUTE_PRIVATE_KEY=0x...
railway variables set OG_COMPUTE_BROKER_URL=https://broker.0g.ai
```

### Option C — Fly.io

```bash
cd ai-agent
fly auth login
fly launch --no-deploy
fly secrets set OG_COMPUTE_PRIVATE_KEY=0x...
fly deploy
```

### Option D — Docker

```bash
cd ai-agent
docker build -t smartchain-ai .
docker run -p 5000:5000 \
  -e OG_COMPUTE_PRIVATE_KEY=0x... \
  -e OG_COMPUTE_BROKER_URL=https://broker.0g.ai \
  smartchain-ai
```

### Option E — Automated Script

```bash
# From project root
./deploy.sh
```

---

## Local Development

```bash
cd ai-agent
cp .env.example .env
# Set OG_COMPUTE_PRIVATE_KEY (optional — falls back to TF without it)

pip install -r requirements.txt
python3 server/app.py   # → http://localhost:5000
```

---

## Environment Variables

```env
# Required for 0G Compute TeeML
OG_COMPUTE_PRIVATE_KEY=0x...        # funded wallet for broker

# Optional (defaults shown)
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
OG_INDEXER_RPC=https://indexer-storage-testnet-standard.0g.ai
STORAGE_PRIVATE_KEY=                # for 0G Storage fine-tune data fetch
PORT=5000
FLASK_ENV=production
```

> Without `OG_COMPUTE_PRIVATE_KEY` the server falls back to local TensorFlow 2.16 gracefully. All endpoints remain functional.

---

## Verify Deployment

```bash
# Health check
curl https://your-app-url.com/health
# → {"status":"healthy","agent":"SmartChain AI v1.0","og_compute":true}

# Optimization test
curl -X POST https://your-app-url.com/optimize \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "priority": "efficiency"}'
# → {"route":"0G Chain Flash Route","fee":3.0,"savings":18.85,...}

# Fine-tune dry run
curl -X POST https://your-app-url.com/fine-tune \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true, "root_hashes": []}'
```

---

## After Deployment

Update the frontend environment variable:

```env
# smartchain_hub_frontend/.env.local
NEXT_PUBLIC_AI_AGENT_URL=https://your-deployed-url.com

# Vercel dashboard
vercel env add NEXT_PUBLIC_AI_AGENT_URL production
# value: https://your-deployed-url.com
vercel --prod
```

---

## Model Architecture

```
Input(6 features)
  amount_norm       log1p(amount) / log1p(100_000)
  priority_eff      one-hot [1,0,0]
  priority_spd      one-hot [0,1,0]
  priority_sec      one-hot [0,0,1]
  congestion        network load [0,1]
  time_of_day_norm  hour / 24

→ Dense(64, relu) → BatchNorm → Dropout(0.1)
→ Dense(32, relu) → Dense(16, relu)
→ Dense(3, sigmoid)

Output(3 heads)
  savings_rate   clipped [0.001, 0.04]
  confidence     clipped [0.70,  0.99]
  risk_score     clipped [0.01,  0.50]

Saved: models/tf_savings_model.keras
```

---

## Running Tests

```bash
cd ai-agent
pytest tests/test_unit.py          # SavingsModel · TransactionOptimizer
pytest tests/test_integration.py   # Flask routes + optimizer pipeline
pytest tests/test_e2e.py           # Full optimize → fine-tune flow
pytest tests/test_security.py      # Input validation · injection · overflow
pytest tests/test_performance.py   # Throughput · latency benchmarks
pytest tests/test_functional.py    # Business logic correctness
pytest tests/test_exploratory.py   # Edge cases · boundary values
pytest tests/test_api.py           # HTTP status codes · response schema
pytest tests/test_all_types.py     # Combined regression suite
```

---

<div align="center">

**SmartChain AI Agent** · Python 3.12 · TensorFlow 2.16 · 0G Compute

`#BuildOn0G` · `#AgenticEconomy`

</div>
