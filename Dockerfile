# image de base
FROM python:3.11-slim

# Dossier de travail dans le conteneur
WORKDIR /app

# Variables d'environnement (Optimisation Python)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Installation des dépendances système (nécessaire pour PostgreSQL)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du projet
COPY ./src .

# Commande par défaut (sera surchargée par docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]