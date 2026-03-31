# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools needed by some scikit-learn wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Runtime image ────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy only the files needed at runtime
COPY danger_api.py .
COPY danger_model.pkl .
COPY model ./model

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Cloud Run injects PORT at runtime; default to 8080 for local docker run
ENV PORT=8080
EXPOSE 8080

# gunicorn: 1 worker process + 8 threads is the GCP Cloud Run recommendation
# for low-latency ML inference containers (single-threaded scikit-learn predict).
# exec form ensures SIGTERM is forwarded correctly so Cloud Run can shut down cleanly.
CMD exec gunicorn \
    --bind :$PORT \
    --workers 1 \
    --threads 8 \
    --timeout 0 \
    danger_api:app
