FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# collectstatic needs a key and a database URL only for settings import, never at runtime.
RUN DJANGO_SECRET_KEY=build-only DATABASE_URL=postgresql://build:build@localhost/build \
    python manage.py collectstatic --noinput

EXPOSE 8000

# Gunicorn, not runserver: the dev server is single-threaded and explicitly
# unsupported for production traffic.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2} --timeout 60 --access-logfile -"]
