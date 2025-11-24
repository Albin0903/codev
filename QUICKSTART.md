# 🚀 Démarrage Rapide (Quickstart)

Ce guide vous permet de lancer le projet **JobFair Connect** en quelques minutes sur votre machine locale.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
1.  **Docker Desktop** (et qu'il est lancé).
2.  **Node.js** (version 18 ou supérieure).
3.  **Git**.

---

## 🏁 Initialisation (Première fois)

### 1. Récupérer le projet
```bash
git clone https://github.com/Albin0903/codev.git
cd codev
```

### 2. Lancer le Backend (Docker)
Cette commande va construire les images et lancer la base de données et le serveur Django.
```bash
docker compose up -d --build
```

### 3. Initialiser la Base de Données
Une fois les conteneurs lancés, préparez la base de données :
```bash
# Appliquer les migrations (création des tables)
docker compose exec web python manage.py migrate

# (Optionnel) Charger des données de démo
docker compose exec web python manage.py setup_demo
```
> *Le script `setup_demo` crée un utilisateur étudiant (`etudiant@test.com` / `test123`) et quelques entreprises.*

### 4. Lancer le Frontend (React)
Ouvrez un **nouveau terminal**, allez dans le dossier frontend et lancez le serveur de développement :
```bash
cd src/frontend
npm install
npm run dev
```

---

## 🌍 Accéder à l'application

*   📱 **Application Mobile** : http://localhost:3000
*   ⚙️ **API Backend** : http://localhost:8000/api/
*   🔑 **Administration** : http://localhost:8000/admin/

---

## 🔄 Utilisation Quotidienne

Pour relancer le projet chaque matin, c'est plus simple :

**Terminal 1 (Backend)**
```bash
docker compose up -d
```

**Terminal 2 (Frontend)**
```bash
cd src/frontend
npm run dev
```

Pour arrêter le backend :
```bash
docker compose down
```

---

## 💡 Commandes Utiles

| Action | Commande |
| :--- | :--- |
| **Voir les logs Backend** | `docker compose logs -f web` |
| **Créer un Admin** | `docker compose exec web python manage.py createsuperuser` |
| **Créer une migration** | `docker compose exec web python manage.py makemigrations` |
| **Appliquer les migrations** | `docker compose exec web python manage.py migrate` |
| **Reset complet (DB)** | `docker compose down -v` (Attention : supprime tout !) |
| **Shell Django** | `docker compose exec web python manage.py shell` |

📖 **Voir README.md pour la documentation complète**
