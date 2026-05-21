# Use an official Python runtime
FROM python:3.12-slim

# 1. Create a user with UID 1000 (Strictly required by Hugging Face)
RUN useradd -m -u 1000 user

# 2. Install system dependencies required for GeoPandas
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Switch to the non-root user and set the working directory
USER user
ENV PATH="/home/user/.local/bin:$PATH"
WORKDIR /app

# 4. Copy requirements and install Python packages
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy your ML Engine files into the container
COPY --chown=user . /app

# 6. Hugging Face routes traffic to port 7860
EXPOSE 7860

# 7. Start the Master FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]