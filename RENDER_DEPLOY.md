# Render Deployment Guide — SmartChain AI Agent

## Step 1 — Go to Render

Open: https://render.com  
Click **"Sign in with GitHub"** → use `mokwathedeveloper`

---

## Step 2 — Create New Web Service

Click **"New +"** → **"Web Service"** → Connect GitHub → select `mokwathedeveloper/SmartChain-Hub`

---

## Step 3 — Service Settings

Copy each value exactly:

**Name:**
```
smartchain-ai-agent
```

**Root Directory:**
```
ai-agent
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 server.app:app
```

**Plan:**
```
Free
```

---

## Step 4 — Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** — add each one:

**Key:**
```
OG_COMPUTE_PRIVATE_KEY
```
**Value:**
```
0xc247c92e7bd4af9c839fbddfb2a7f1bf06c4dd2fae4eba149dd10b0078574b6c
```

---

**Key:**
```
STORAGE_PRIVATE_KEY
```
**Value:**
```
0xc247c92e7bd4af9c839fbddfb2a7f1bf06c4dd2fae4eba149dd10b0078574b6c
```

---

**Key:**
```
OG_COMPUTE_BROKER_URL
```
**Value:**
```
https://broker.0g.ai
```

---

**Key:**
```
OG_COMPUTE_MODEL
```
**Value:**
```
llama-3.1-8b-instruct
```

---

**Key:**
```
OG_COMPUTE_RPC
```
**Value:**
```
https://evmrpc-testnet.0g.ai
```

---

**Key:**
```
PORT
```
**Value:**
```
10000
```

---

**Key:**
```
FLASK_ENV
```
**Value:**
```
production
```

---

## Step 5 — Deploy

Click **"Create Web Service"** — build takes ~3 minutes.

---

## Step 6 — After Deploy

Render gives you a URL like:
```
https://smartchain-ai-agent.onrender.com
```

Paste that URL here so the .env files can be updated.

---

## Step 7 — Verify it works

Open in browser:
```
https://smartchain-ai-agent.onrender.com/health
```

You should see:
```json
{
  "status": "healthy",
  "agent": "SmartChain AI v1.0",
  "og_compute": true
}
```
