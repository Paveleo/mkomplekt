from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import unquote, urlparse

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(key: str, default: str | None = None) -> str | None:
    return os.getenv(key, default)


def env_bool(key: str, default: bool = False) -> bool:
    value = env(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(key: str, default: list[str] | None = None) -> list[str]:
    value = env(key)
    if not value:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


def env_int(key: str, default: int) -> int:
    value = env(key)
    if value is None or not value.strip():
        return default
    return int(value)


def resolve_path(raw: str, *, root: Path = BASE_DIR) -> Path:
    path = Path(raw)
    if path.is_absolute():
        return path
    if path.parts and path.parts[0] == "backend":
        return (BASE_DIR.parent / path).resolve()
    return (root / path).resolve()


def database_config() -> dict:
    raw = env("DATABASE_URL")
    if not raw:
        return {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": str(BASE_DIR / "db.sqlite3"),
            }
        }

    if raw.startswith("sqlite:///"):
        sqlite_path = unquote(raw.removeprefix("sqlite:///"))
        return {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": str(resolve_path(sqlite_path)),
            }
        }

    parsed = urlparse(raw)
    scheme = parsed.scheme.lower()
    if scheme not in {"postgres", "postgresql", "postgresql+psycopg"}:
        raise ValueError(f"Unsupported DATABASE_URL scheme: {scheme}")

    return {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed.path.lstrip("/")),
            "USER": unquote(parsed.username or ""),
            "PASSWORD": unquote(parsed.password or ""),
            "HOST": parsed.hostname or "localhost",
            "PORT": parsed.port or 5432,
            "CONN_MAX_AGE": 60,
        }
    }


SECRET_KEY = env("SECRET_KEY", "change-me") or "change-me"
DEBUG = env("APP_ENV", "development") != "production"
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", ["localhost", "127.0.0.1"])
CORS_ALLOWED_ORIGINS = env_list("CORS_ORIGINS", ["http://localhost:5173"])
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", [])
CORS_ALLOW_CREDENTIALS = True

COOKIE_SECURE = env_bool("COOKIE_SECURE", False)
COOKIE_DOMAIN = env("COOKIE_DOMAIN") or None
USE_X_FORWARDED_HOST = env_bool("USE_X_FORWARDED_HOST", True)

MEDIA_ROOT = resolve_path(env("MEDIA_ROOT", "media") or "media")
MEDIA_URL = (env("MEDIA_URL", "/media") or "/media").rstrip("/") + "/"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "shop",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
DATABASES = database_config()

AUTH_PASSWORD_VALIDATORS = []
AUTH_USER_MODEL = "shop.User"

LANGUAGE_CODE = "ru-ru"
TIME_ZONE = env("TIME_ZONE", "Asia/Yakutsk") or "Asia/Yakutsk"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
APPEND_SLASH = False

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = COOKIE_SECURE
SESSION_COOKIE_DOMAIN = COOKIE_DOMAIN

CSRF_COOKIE_SECURE = COOKIE_SECURE
CSRF_COOKIE_DOMAIN = COOKIE_DOMAIN
CSRF_COOKIE_SAMESITE = "Lax"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
SECURE_HSTS_SECONDS = env_int("SECURE_HSTS_SECONDS", 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = env("SECURE_REFERRER_POLICY", "same-origin") or "same-origin"
X_FRAME_OPTIONS = env("X_FRAME_OPTIONS", "DENY") or "DENY"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "shop.authentication.CsrfExemptSessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}
