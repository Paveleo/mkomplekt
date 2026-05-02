# Deploy on Timeweb VPS

This project is ready for deployment with Docker Compose.

## Production files

- [docker-compose.prod.yml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/docker-compose.prod.yml)
- [docker-compose.backend.yml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/docker-compose.backend.yml)
- [backend/.env.production.example](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/backend/.env.production.example)
- [deploy/timeweb-cloud-init.example.yaml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/deploy/timeweb-cloud-init.example.yaml)

## Option 1. Manual deploy

```bash
git clone <YOUR_REPOSITORY_URL> mkomplekt
cd mkomplekt
cp backend/.env.production.example backend/.env.production
docker compose -f docker-compose.prod.yml up -d --build
```

Create admin:

```bash
docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser
```

## Backend-only deploy

Use this if the frontend is hosted somewhere else, for example on REG.RU.

Recommended DNS:

- `mebelkomplekt14.ru` -> frontend hosting
- `www.mebelkomplekt14.ru` -> frontend hosting
- `api.mebelkomplekt14.ru` -> `147.45.158.67`

Recommended frontend env:

```env
VITE_API_BASE_URL=https://api.mebelkomplekt14.ru
```

Recommended backend env:

```env
ALLOWED_HOSTS=api.mebelkomplekt14.ru,147.45.158.67
CORS_ORIGINS=https://mebelkomplekt14.ru,https://www.mebelkomplekt14.ru
CSRF_TRUSTED_ORIGINS=https://api.mebelkomplekt14.ru,https://mebelkomplekt14.ru,https://www.mebelkomplekt14.ru
COOKIE_DOMAIN=.mebelkomplekt14.ru
```

Start backend-only stack:

```bash
docker compose -f docker-compose.backend.yml up -d --build
```

## Option 2. Cloud-init

Use:

- [CLOUD_INIT_TIMEWEB.md](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/CLOUD_INIT_TIMEWEB.md)
- [deploy/timeweb-cloud-init.example.yaml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/deploy/timeweb-cloud-init.example.yaml)

The cloud-init template:

- creates a deploy user
- installs Docker and Docker Compose
- creates 4 GB swap
- enables UFW
- writes `backend/.env.production`
- clones the repo
- starts the production stack automatically

## Useful commands after start

```bash
cd /opt/mkomplekt
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml exec api python manage.py check --deploy
```

## Admin URL

- `http://your-domain/django-admin/`

## Persistent data

Docker volumes:

- `postgres_data` for PostgreSQL
- `media_data` for uploaded files and images

## HTTPS

The current stack exposes HTTP on port `80`.

After TLS is configured, enable:

```env
COOKIE_SECURE=true
SECURE_SSL_REDIRECT=true
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=true
SECURE_HSTS_PRELOAD=true
```
