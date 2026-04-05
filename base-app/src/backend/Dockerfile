FROM python:3.13-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev libpq-dev curl && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl netcat-openbsd && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 appuser
WORKDIR /app
COPY --from=builder /root/.local /home/appuser/.local
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
RUN chmod +x entrypoint.sh
RUN chown -R appuser:appuser /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PATH=/home/appuser/.local/bin:$PATH DJANGO_SETTINGS_MODULE=config.settings
USER appuser
RUN mkdir -p /app/db && chown appuser:appuser /app/db
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:3000/health/ || exit 1
ENTRYPOINT ["sh", "entrypoint.sh"]