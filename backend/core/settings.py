import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')


def env_bool(name, default=False):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def env_list(name, default=None):
    raw = (os.environ.get(name) or '').strip()
    if not raw:
        return list(default or [])
    return [item.strip() for item in raw.split(',') if item.strip()]


IS_RENDER = env_bool('RENDER') or bool(os.environ.get('RENDER_SERVICE_ID'))

# DEBUG defaults to False; local development opts in via DEBUG=True in backend/.env
DEBUG = env_bool('DEBUG', default=False) and not IS_RENDER
IS_PRODUCTION = not DEBUG

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '').strip()
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "DJANGO_SECRET_KEY environment variable is required in production. "
            "Generate one with: python -c \"from django.core.management.utils import "
            "get_random_secret_key; print(get_random_secret_key())\""
        )
    # Development-only throwaway key. Never used when DEBUG=False.
    SECRET_KEY = 'django-insecure-local-development-only-do-not-deploy'

# Hosts allowed to serve this app. Set ALLOWED_HOSTS as a comma separated list in production.
ALLOWED_HOSTS = env_list('ALLOWED_HOSTS')
if not ALLOWED_HOSTS:
    if DEBUG:
        ALLOWED_HOSTS = ['*']
    else:
        # Render injects the external hostname; keep the service reachable out of the box.
        ALLOWED_HOSTS = ['.onrender.com']
render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',

    # Local apps
    'menu',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database Configuration (PostgreSQL in production, SQLite for local development).
# Production MUST use PostgreSQL: Render's filesystem is ephemeral, so a SQLite file
# is wiped on every container restart.
DATABASE_URL = (os.environ.get('DATABASE_URL') or '').strip()

if DATABASE_URL.startswith('postgres'):
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            # conn_max_age=0 prevents dead pooled connections with Neon serverless compute
            conn_max_age=int(os.environ.get('DB_CONN_MAX_AGE', '0')),
            ssl_require=env_bool('DB_SSL_REQUIRE', default=True),
        )
    }
elif os.environ.get('DB_HOST'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'mehmon_db'),
            'USER': os.environ.get('DB_USER', 'mehmon_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
elif IS_PRODUCTION:
    raise RuntimeError(
        "DATABASE_URL (PostgreSQL) is required in production. SQLite is refused here "
        "because the container filesystem is ephemeral and all menu data would be lost "
        "on restart. Set DATABASE_URL in your hosting provider's environment variables."
    )
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Tashkent'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images) — served by WhiteNoise in production
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# Media files for uploaded food images.
# On Render, point MEDIA_ROOT at a mounted persistent disk (e.g. /var/data/media),
# otherwise uploads disappear on every deploy. Without a disk, use the image_url field.
MEDIA_URL = '/media/'
MEDIA_ROOT = Path(os.environ.get('MEDIA_ROOT') or (BASE_DIR / 'media'))

# Reject oversized uploads before they reach disk (10 MB)
MAX_UPLOAD_IMAGE_SIZE = int(os.environ.get('MAX_UPLOAD_IMAGE_SIZE', 10 * 1024 * 1024))
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_IMAGE_SIZE + (1024 * 1024)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Auto-translation of menu names/descriptions via public Google endpoints.
# Disable (AUTO_TRANSLATE=False) to keep writes fully offline and instant.
AUTO_TRANSLATE = env_bool('AUTO_TRANSLATE', default=True)

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        # The public menu is readable by anyone; every write requires a valid admin token.
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': None,  # Return direct lists for menu & admin smoothly
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'login': '10/min',
    },
}

# CORS & CSRF Settings for Client & Admin
CORS_ALLOW_CREDENTIALS = False  # Auth uses a bearer-style token header, not cookies

DEFAULT_DEV_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
]

CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS')
CORS_ALLOWED_ORIGIN_REGEXES = env_list('CORS_ALLOWED_ORIGIN_REGEXES')

if DEBUG:
    # Local development: allow any origin so phones on the LAN can reach the dev server.
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    if not CORS_ALLOWED_ORIGINS and not CORS_ALLOWED_ORIGIN_REGEXES:
        # Sensible default for the Vercel/Netlify deployments this project ships with.
        CORS_ALLOWED_ORIGIN_REGEXES = [
            r'^https://.*\.vercel\.app$',
            r'^https://.*\.netlify\.app$',
            r'^https://.*\.onrender\.com$',
        ]

CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'cache-control',
    'content-type',
    'dnt',
    'origin',
    'pragma',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CSRF_TRUSTED_ORIGINS = DEFAULT_DEV_ORIGINS + [
    'https://*.vercel.app',
    'https://*.netlify.app',
    'https://*.onrender.com',
]
CSRF_TRUSTED_ORIGINS += env_list('CSRF_TRUSTED_ORIGINS')

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False

# Production hardening
if IS_PRODUCTION:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', 60 * 60 * 24 * 30))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': os.environ.get('LOG_LEVEL', 'INFO'),
    },
}
