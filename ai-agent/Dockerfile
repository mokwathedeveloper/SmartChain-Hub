# Use official Python runtime as base image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire AI Agent source
COPY . .

# Expose the port
EXPOSE 5000

# Use Gunicorn for production-ready serving
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server.app:app"]
