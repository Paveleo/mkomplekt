# Backend

Серверная часть переведена на:

- Django
- Django REST Framework
- PostgreSQL
- cookie-based session auth
- локальное файловое хранилище изображений

## 1. Установка

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
Copy-Item .env.example .env
```

Пример:

```env
DATABASE_URL=postgresql://postgres:12345@127.0.0.1:5432/mkomplekt
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ALLOWED_HOSTS=localhost,127.0.0.1
COOKIE_SECURE=false
COOKIE_DOMAIN=
APP_ENV=development
MEDIA_ROOT=media
MEDIA_URL=/media
```

Если `DATABASE_URL` не задан, Django использует локальный `SQLite` файл `backend/db.sqlite3`. Для production и Docker используется PostgreSQL.

## 3. Миграции

```bash
python manage.py migrate
```

Если меняете модели:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Создание администратора

```bash
python manage.py createsuperuser
```

Для входа через frontend администратору нужен флаг `is_admin=true`. Если аккаунт создан через `createsuperuser`, он уже получает права Django admin. При необходимости можно выставить `is_admin` через `python manage.py shell`.

## 5. Запуск API

```bash
python manage.py runserver 0.0.0.0:8000
```

API будет доступен на `http://localhost:8000`, Django admin на `http://localhost:8000/django-admin/`.

## Docker

Из корня проекта:

```bash
docker compose up --build
```

Это поднимет:

- PostgreSQL
- Django + DRF + Gunicorn
- Nginx со статикой frontend

## Поддерживаемые API маршруты

- `/api/auth/*`
- `/api/catalog/*`
- `/api/account/*`
- `/api/admin/*`

Маршруты сохранены совместимыми с текущим frontend.
