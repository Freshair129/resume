FROM python@sha256:da047cb8f9d1d98e5c070f5300ba9f7274e33b8fc0e5be5ed88740aed1b95ba9
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 HF_HUB_OFFLINE=1 LALIN_VOICE_WORKER_DATA_DIR=/data
WORKDIR /repo/apps/api
COPY apps/api/requirements-voice-worker-linux-cpu.lock.txt ./
RUN pip install --only-binary=:all: -r requirements-voice-worker-linux-cpu.lock.txt
COPY apps/api/app/voice_worker ./app/voice_worker
COPY apps/api/app/__init__.py ./app/__init__.py
RUN useradd --uid 10001 --create-home worker && mkdir -p /data /run/voice-worker && chown -R worker:worker /data /run/voice-worker && chmod 700 /data && chmod 750 /run/voice-worker
USER worker
ENTRYPOINT ["python", "-m", "app.voice_worker"]
