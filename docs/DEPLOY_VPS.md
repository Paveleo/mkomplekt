# Deploy на VPS

Ниже базовая схема деплоя для:

- `React/Vite` фронтенда
- `FastAPI` backend
- `PostgreSQL`
- `Nginx`
- `systemd`

## 1. Что должно быть на сервере

- `python 3.11+`
- `node 20+`
- `postgresql`
- `nginx`

## 2. Переменные backend

Создайте файл `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://mkomplekt:strong-password@127.0.0.1:5432/mkomplekt
SECRET_KEY=very-long-random-secret
ACCESS_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://your-domain.ru
ALLOWED_HOSTS=your-domain.ru,www.your-domain.ru
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.ru
APP_ENV=production
MEDIA_ROOT=/var/www/mkomplekt/media
MEDIA_URL=/media
```

## 3. Миграции БД

После настройки PostgreSQL:

```bash
cd /var/www/mkomplekt/backend
source .venv/bin/activate
alembic upgrade head
python -m app.create_admin
```

## 4. Запуск backend через systemd

Пример юнита:

`/etc/systemd/system/mkomplekt-api.service`

```ini
[Unit]
Description=MKomplekt API
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mkomplekt/backend
EnvironmentFile=/var/www/mkomplekt/backend/.env
ExecStart=/var/www/mkomplekt/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Запуск:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mkomplekt-api
sudo systemctl start mkomplekt-api
sudo systemctl status mkomplekt-api
```

## 5. Сборка фронтенда

На сервере:

```bash
cd /var/www/mkomplekt
npm ci
npm run build
```

Если фронтенд и backend на одном домене, можно не задавать `VITE_API_BASE_URL`, а отдавать `/api` и `/media` через `Nginx`.

## 6. Nginx

Пример конфига:

```nginx
server {
    listen 80;
    server_name your-domain.ru www.your-domain.ru;

    root /var/www/mkomplekt/dist;
    index index.html;

    client_max_body_size 25M;

    location /media/ {
        alias /var/www/mkomplekt/media/;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

После этого отдельно ставьте `HTTPS`, например через `certbot`.

## 7. Обновление проекта

При каждом деплое:

```bash
cd /var/www/mkomplekt
git pull

cd backend
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart mkomplekt-api

cd /var/www/mkomplekt
npm ci
npm run build
sudo systemctl reload nginx
```

## 8. Что важно не пропустить

- `COOKIE_SECURE=true` включать только под HTTPS
- `ALLOWED_HOSTS` и `CORS_ORIGINS` должны совпадать с вашим доменом
- директория `MEDIA_ROOT` должна существовать и быть доступна пользователю сервиса
- `alembic upgrade head` должен выполняться при каждом изменении схемы
