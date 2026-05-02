#!/bin/sh
set -e

python - <<'PY'
import os
import time
from urllib.parse import urlparse

import psycopg

database_url = os.getenv("DATABASE_URL", "")
if not database_url or database_url.startswith("sqlite"):
    raise SystemExit(0)

dsn = database_url.replace("postgresql+psycopg://", "postgresql://", 1)
parsed = urlparse(dsn)
host = parsed.hostname or "db"
port = parsed.port or 5432

for attempt in range(30):
    try:
        conn = psycopg.connect(dsn, connect_timeout=5)
        conn.close()
        print(f"Database {host}:{port} is ready.")
        break
    except Exception as exc:  # pragma: no cover
        print(f"Waiting for database {host}:{port} ({attempt + 1}/30): {exc}")
        time.sleep(2)
else:
    raise SystemExit("Database is unavailable after 30 attempts.")
PY

python manage.py collectstatic --noinput
python manage.py migrate --noinput

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout "${GUNICORN_TIMEOUT:-120}" \
    --access-logfile - \
    --error-logfile - \
    --worker-tmp-dir /dev/shm
