FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-train the TensorFlow model during build so first request is fast
RUN python3 -c "from models.savings_model import SavingsModel; SavingsModel(); print('Model ready')"

EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 1 --timeout 120 server.app:app
