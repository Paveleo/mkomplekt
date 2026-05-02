# Timeweb Cloud-Init

Use:

- [deploy/timeweb-cloud-init.example.yaml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/deploy/timeweb-cloud-init.example.yaml)
- [deploy/timeweb-cloud-init.147.45.158.67.example.yaml](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/deploy/timeweb-cloud-init.147.45.158.67.example.yaml)

## Replace before paste

Replace:

- `__SSH_PUBLIC_KEY__`
- `__POSTGRES_PASSWORD__`
- `__DJANGO_SECRET_KEY__`
- `__DOMAIN__`
- `__SERVER_IP__`
- `__REPO_URL__`
- `__REPO_BRANCH__`

## What the template does

- creates `deploy` user
- installs Docker Engine and Docker Compose plugin
- creates 4 GB swap
- enables UFW for `22`, `80`, `443`
- prepares `backend/.env.production`
- clones the repo into `/opt/mkomplekt`
- starts `docker-compose.prod.yml`

## Recommended defaults

- `__REPO_BRANCH__` -> `main`
- `__DOMAIN__` -> your production domain
- `__SERVER_IP__` -> public IPv4 of the VPS

## First checks after boot

```bash
ssh deploy@YOUR_SERVER_IP
cd /opt/mkomplekt
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

## Create admin

```bash
cd /opt/mkomplekt
docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser
```

## Important

This template starts the project on HTTP port `80`.

If the VPS already exists, cloud-init will not run automatically anymore.
For an existing server, use:

- [deploy/bootstrap-existing-vps.sh](/C:/Users/pavel/OneDrive/Desktop/mkomplekt/deploy/bootstrap-existing-vps.sh)

After HTTPS is configured, update:

```env
SECURE_SSL_REDIRECT=true
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=true
SECURE_HSTS_PRELOAD=true
```
