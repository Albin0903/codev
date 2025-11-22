import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'forum_db'),
        'USER': os.environ.get('DB_USER', 'admin'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'password_secret'),
        'HOST': os.environ.get('DB_HOST', 'db'), # 'db' est le nom du service dans docker-compose
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}