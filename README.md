# 🎓 Forum Alternance Connect

Plateforme de gestion et de matching pour le forum entreprise de Polytech Lyon.
Application web permettant aux étudiants et recruteurs de se "matcher" (style Tinder/JobDating) et de générer un planning d'entretiens optimisé.

---

## 🛠 La Stack Technique

* **Backend :** Django 4.2+ (Python 3.11)
* **Frontend :** Django Templates + HTMX + Tailwind CSS
* **Base de données :** PostgreSQL 15
* **Algorithme :** NetworkX (Bipartite Matching)
* **Infrastructure :** Docker & Docker Compose

---

## 🚀 Installation (Premier démarrage)

**Prérequis :** Avoir **Docker Desktop** (et Git) installé et lancé.

1.  **Cloner le projet :**
    ```bash
    git clone <url_du_repo>
    cd <nom_du_dossier>
    ```

2.  **Construire et lancer les conteneurs :**
    Cette étape peut prendre quelques minutes la première fois (téléchargement des images).
    ```bash
    docker compose up -d --build
    ```

3.  **Initialiser la Base de Données :**
    Une fois les conteneurs lancés, il faut créer les tables dans PostgreSQL.
    ```bash
    docker compose exec web python manage.py migrate
    ```

4.  **Créer un compte Administrateur :**
    Pour accéder au backend Django (/admin).
    ```bash
    docker compose exec web python manage.py createsuperuser
    ```

👉 **Accès à l'application :**
* Site web : [http://localhost:8000](http://localhost:8000)
* Administration : [http://localhost:8000/admin](http://localhost:8000/admin)

---

## ⚡️ Commandes Quotidiennes (Cheat Sheet)

Voici les commandes que vous utiliserez tous les jours.

### 🟢 Lancer et Arrêter le serveur

* **Démarrer le projet** (en arrière-plan) :
    ```bash
    docker compose up -d
    ```

* **Arrêter le projet** (éteint proprement les conteneurs) :
    ```bash
    docker compose down
    ```

* **Voir les logs** (très important pour débugger !) :
    ```bash
    docker compose logs -f
    ```
    *(Faire `Ctrl+C` pour quitter les logs, cela n'arrête pas le serveur).*

### 🐍 Commandes Django (via Docker)

⚠️ **Règle d'or :** Ne lancez jamais `python manage.py ...` directement dans votre terminal Windows/Mac. Il faut passer par `docker compose exec web ...`.

* **Créer de nouvelles migrations** (après avoir modifié `models.py`) :
    ```bash
    docker compose exec web python manage.py makemigrations
    ```

* **Appliquer les migrations** (mettre à jour la BDD) :
    ```bash
    docker compose exec web python manage.py migrate
    ```

* **Ouvrir un Shell Python** (pour tester des scripts ou l'algo) :
    ```bash
    docker compose exec web python manage.py shell
    ```

* **Installer une nouvelle librairie Python** :
    1. Ajoutez la ligne dans le fichier `requirements.txt`.
    2. Reconstruisez le conteneur :
       ```bash
       docker compose up -d --build
       ```

### 🧹 En cas de gros problème (Reset)

Si votre base de données est corrompue ou que rien ne marche :

* **Tout effacer (BDD comprise) et repartir à zéro :**
    ```bash
    docker compose down -v
    ```
    *(L'option `-v` supprime aussi le volume de la base de données).*

---

## 📂 Structure du Projet

```text
/
├── docker-compose.yml   # Orchestration des services (Web + DB)
├── Dockerfile           # Configuration de l'image Python
├── requirements.txt     # Liste des librairies Python
└── src/                 # RACINE DU PROJET DJANGO
    ├── manage.py        # Point d'entrée Django
    ├── backend/         # Configuration globale (settings.py, urls.py)
    ├── core/            # App principale (Models, Views de base)
    └── theme/           # Configuration Tailwind (si applicable)