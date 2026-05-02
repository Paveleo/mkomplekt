# mkomplekt

Проект разделён на две части:

- `frontend`: React + Vite + TypeScript
- `backend`: Django + Django REST Framework + PostgreSQL

## Frontend

```bash
npm install
npm run dev
```

Если нужен явный адрес API:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Если переменная не задана, dev-сервер фронтенда использует относительные `/api` и `/media`.

## Backend

Полная инструкция находится в [backend/README.md](./backend/README.md).

Короткий локальный запуск:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

## Docker Compose

Полный стек в контейнерах:

```bash
docker compose up --build
```

После старта:

- сайт: `http://localhost`
- API: `http://localhost/api`
- Django admin: `http://localhost/django-admin/`

Поднимаются сервисы:

- `db`: PostgreSQL 16
- `api`: Django + DRF + Gunicorn
- `web`: Nginx + собранный Vite frontend

## Что уже покрыто

- публичный каталог
- страница товара
- регистрация и авторизация
- личный кабинет
- корзина
- оформление заказа из корзины
- админские CRUD для категорий и товаров
- список заказов и смена статуса
- CSV-импорт товаров
- локальное файловое хранилище изображений
