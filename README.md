# 📘 Documentation Technique - JobFair Connect

## 🏗 Architecture du Projet

Le projet repose sur une architecture **hybride** séparant clairement le Backend (API) du Frontend (Client).

### 1. Backend (Django REST Framework)
*   **Dossier** : `src/` (Racine Django)
*   **Port** : `8000`
*   **Rôle** :
    *   Gère la base de données PostgreSQL.
    *   Expose une API REST pour le frontend.
    *   Gère l'authentification (Token Auth).
    *   Fournit l'interface d'administration (`/admin`).
*   **Apps Django** :
    *   `backend` : Configuration globale (`settings.py`, `urls.py`).
    *   `core` : Cœur de l'application (Modèles, Vues API, Logique métier).

### 2. Frontend (React + Vite)
*   **Dossier** : `src/frontend/`
*   **Port** : `3000`
*   **Rôle** :
    *   Interface utilisateur mobile-first.
    *   Consomme l'API Django.
    *   Gère la navigation et l'état local.
*   **Tech Stack** : React 19, TypeScript, Tailwind CSS v3.

### 3. Base de Données (PostgreSQL)
*   **Service Docker** : `db`
*   **Port** : `5432`
*   **Persistance** : Volume Docker `postgres_data`.

---

## 📂 Structure des Dossiers

```
codev/
├── docker-compose.yml      # Orchestration des services (DB + Backend)
├── Dockerfile              # Image Docker pour le Backend Django
├── requirements.txt        # Dépendances Python
├── src/
│   ├── manage.py           # CLI Django
│   ├── backend/            # Config Django (settings, urls)
│   ├── core/               # Application principale
│   │   ├── models.py       # Définition des données (Student, Company, Match...)
│   │   ├── api_views.py    # Endpoints de l'API REST
│   │   ├── serializers.py  # Transformation JSON <-> Objets Python
│   │   └── management/     # Commandes personnalisées (ex: setup_demo)
│   └── frontend/           # Application React
│       ├── src/
│       │   ├── pages/      # Écrans (Login, Swipe, Profile...)
│       │   ├── services/   # Appels API (api.ts)
│       │   └── components/ # Composants réutilisables
│       ├── package.json    # Dépendances JS
│       └── vite.config.ts  # Config Build & Dev Server
```

---

## 🧩 Modèles de Données (`src/core/models.py`)

### Utilisateurs & Profils
*   **User** (Django Built-in) : Gère l'authentification (username, password).
*   **Student** : Extension du User. Contient les infos spécifiques (École, Formation, CV, Préférences, Loisirs, Thème).
    *   *Note* : Lié en OneToOne avec `User`.
    *   **Nouveaux champs** :
        *   `hobbies` : Loisirs et activités extra-scolaires.
        *   `theme` : Préférence de thème (clair/sombre).

### Matching & Interactions
*   **Company** : Représente une entreprise/recruteur.
*   **Skill** : Compétences techniques (Tags) utilisées pour le matching.
    *   *Note* : Relation ManyToMany avec `Student`.
*   **Swipe** : Enregistre l'action d'un étudiant sur une entreprise (Like/Dislike).
*   **Match** : Créé automatiquement si un Swipe est positif (pour l'instant, simulation de match mutuel).
*   **Interview** : Rendez-vous planifié suite à un match.

---

## 🔌 API Endpoints (`src/core/api_urls.py`)

L'API est préfixée par `/api/`.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/login/` | Authentification (Retourne un Token) |
| `POST` | `/logout/` | Déconnexion |
| `GET` | `/me/` | Infos de l'utilisateur connecté |
| `PATCH` | `/me/` | Mise à jour du profil (inclut prénom, nom, école, compétences, loisirs, thème...) |
| `GET` | `/companies/` | Liste des entreprises |
| `GET` | `/companies/next_card/` | Prochaine entreprise à swiper |
| `POST` | `/swipes/` | Enregistrer un swipe (Left/Right) |
| `GET` | `/matches/` | Liste des matchs confirmés |
| `GET` | `/interviews/` | Planning des entretiens |

---

## 🛠 Développement & Commandes

### Backend (Django)
Les commandes s'exécutent via Docker pour garantir l'environnement.

*   **Créer une migration** (après modif de `models.py`) :
    ```bash
    docker compose exec web python manage.py makemigrations
    ```
*   **Appliquer les migrations** :
    ```bash
    docker compose exec web python manage.py migrate
    ```
*   **Créer un Superuser** (Admin) :
    ```bash
    docker compose exec web python manage.py createsuperuser
    ```
*   **Shell Python** (Debug) :
    ```bash
    docker compose exec web python manage.py shell
    ```

### Frontend (React)
*   **Ajouter une librairie** :
    ```bash
    cd src/frontend
    npm install <nom_paquet>
    ```
*   **Linter le code** :
    ```bash
    npm run lint
    ```

---

## 🔐 Authentification

Le projet utilise **TokenAuthentication** de Django REST Framework.
1.  Le client envoie `username` + `password` à `/api/login/`.
2.  Le serveur retourne un `token`.
3.  Le client stocke ce token (localStorage) et l'ajoute dans le header `Authorization: Token <token>` pour chaque requête suivante.

---

## ⚠️ Points d'attention

1.  **CORS** : Configuré pour accepter les requêtes venant de `localhost:3000`. Si vous changez le port du frontend, mettez à jour `CORS_ALLOWED_ORIGINS` dans `settings.py`.
2.  **Images** : Les images uploadées (Logos, CVs) sont stockées dans le dossier `media/` à la racine (monté en volume Docker).
3.  **Admin** : Accessible sur `http://localhost:8000/admin`. Utilisez un compte Superuser pour y accéder.
4.  **Route par défaut** : L'application s'ouvre automatiquement sur `/profile` après connexion (au lieu de `/swipe`).

### Étape 1 : Backend Django

```bash
# 1. Cloner le projet
git clone https://github.com/Albin0903/codev.git
cd codev

# 2. Lancer les conteneurs Docker
docker compose up -d --build

# 3. Créer les tables de la base de données
docker compose exec web python manage.py migrate

# 4. Créer les données de démo (1 étudiant + 3 entreprises + matchs)
docker compose exec web python manage.py setup_demo
```

✅ **Backend prêt sur** http://localhost:8000

### Étape 2 : Frontend React

```bash
# 1. Aller dans le dossier frontend
cd src/frontend

# 2. Installer les dépendances npm
npm install

# 3. Lancer le serveur de développement Vite
npm run dev
```

✅ **Frontend prêt sur** http://localhost:3000

---

## 👤 Connexion à l'Application

Ouvrez http://localhost:3000 dans votre navigateur (mode mobile dans DevTools).

**Compte de test créé automatiquement :**
- **Email :** `etudiant@test.com`
- **Mot de passe :** `test123`

**Compte administrateur (pour accéder à http://localhost:8000/admin/) :**
- **Username :** `root`
- **Mot de passe :** `codev123`
- ⚠️ À créer manuellement : `docker compose exec web python manage.py createsuperuser`

---

## 📱 Fonctionnalités Disponibles

### ✅ Ce qui fonctionne

1. **🔄 Page Swipe** : Parcourir les entreprises (3 créées automatiquement)
2. **❤️ Système de Like/Pass** : Swiper left (pass) ou right (like) sur les cartes
3. **🎯 Matchs** : Voir les entreprises qui vous ont aussi liké (1 match créé en démo)
4. **📅 Planning** : Consulter les entretiens programmés (1 entretien demain 14h)
5. **👤 Profil** : Voir et modifier vos informations
6. **🔌 API REST** : Endpoints Django REST Framework complets

### 📊 Données de Démo Créées

Le script `setup_demo` crée automatiquement :

- ✅ **1 utilisateur étudiant** : Marie Dupont
  - Email: `etudiant@test.com`
  - Programme: Master Informatique - Spécialité Web
  - 8 compétences (React, TypeScript, Python, Django...)

- ✅ **3 entreprises** :
  1. **Innovatech Solutions** (Tech/SaaS)
  2. **Creative Minds** (Design/UX)
  3. **DataFlow Analytics** (Data Science/IA)

- ✅ **1 match mutuel** avec Innovatech Solutions
- ✅ **1 entretien programmé** pour demain à 14h00 (Stand A23)

---

## 🌐 URLs Importantes

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application Mobile** | http://localhost:3000 | `etudiant@test.com` / `test123` |
| **API Backend** | http://localhost:8000/api/ | Session auth via cookies |
| **Admin Django** | http://localhost:8000/admin/ | `root` / `codev123` |
| **API Browser** | http://localhost:8000/api/ | Interface navigable DRF |

---

## 🔌 API Endpoints Disponibles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/me/` | Profil utilisateur connecté |
| `GET` | `/api/companies/` | Liste des entreprises |
| `GET` | `/api/companies/next_card/` | Prochaine entreprise à swiper |
| `POST` | `/api/swipes/` | Créer un swipe (like/pass) |
| `GET` | `/api/matches/` | Liste des matchs mutuels |
| `GET` | `/api/interviews/` | Liste des entretiens programmés |

**Format de requête pour swiper :**
```json
POST /api/swipes/
{
  "company_id": 1,
  "direction": "right"  // ou "left"
}
```

---

## ⚡️ Commandes Quotidiennes

### 🟢 Backend Django

```bash
# Démarrer les conteneurs
docker compose up -d

# Arrêter les conteneurs
docker compose down

# Voir les logs en temps réel
docker compose logs -f web

# Créer des migrations
docker compose exec web python manage.py makemigrations

# Appliquer les migrations
docker compose exec web python manage.py migrate

# Recréer les données de démo
docker compose exec web python manage.py setup_demo

# Shell Django
docker compose exec web python manage.py shell

# Créer un superuser
docker compose exec web python manage.py createsuperuser
```

### 🎨 Frontend React

```bash
# Lancer le serveur de dev
cd src/frontend && npm run dev

# Installer une nouvelle dépendance
npm install nom-du-package

# Build de production
npm run build

# Preview du build
npm run preview
```

### 🧹 Reset Complet

```bash
# Supprimer tout (y compris la BDD)
docker compose down -v

# Tout recréer
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py setup_demo

# Relancer le frontend
cd src/frontend && npm run dev
```

---

## 📂 Structure du Projet

```
codev/
├── docker-compose.yml          # Orchestration Docker (Django + PostgreSQL)
├── Dockerfile                  # Image Docker pour Django
├── requirements.txt            # Dépendances Python (Django, DRF, CORS...)
├── README.md                   # Ce fichier
├── QUICKSTART.md               # Guide de démarrage rapide
│
├── src/                        # 🚀 CODE SOURCE COMPLET
│   ├── manage.py              # Point d'entrée Django
│   │
│   ├── backend/               # ⚙️ Configuration Django
│   ├── manage.py              # Point d'entrée Django
│   ├── backend/               # Configuration du projet
│   │   ├── settings.py       # ✅ DRF + CORS configurés
│   │   └── urls.py           # ✅ Routes API ajoutées
│   ├── core/                  # App principale
│   │   ├── models.py         # Models (Student, Company, Match...)
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── api_views.py      # ViewSets API
│   │   ├── api_urls.py       # URLs API (/api/...)
│   │   ├── admin.py          # Configuration admin Django
│   │   └── management/
│   │       └── commands/
│   │           └── setup_demo.py  # Script de démo
│   ├── templates/             # Templates Django (non utilisés)
│   │
│   └── frontend/              # ⚛️ FRONTEND REACT
       ├── components/            # Composants UI réutilisablesles
       │   ├── BackgroundBlobs.tsx   # Effets visuels (blobs animés)
       │   └── BottomNavigation.tsx  # Navigation mobile bottom bar
       ├── pages/                 # Pages de l'application
       │   ├── SwipeScreen.tsx   # 🔄 Page de swipe (cards)
       │   ├── MatchScreen.tsx   # 💝 Écran de match
       │   ├── ScheduleScreen.tsx # 📅 Planning des entretiens
       │   └── ProfileScreen.tsx  # 👤 Profil étudiant
       ├── services/
       │   └── api.ts            # ✅ Service API (appels vers Django)
       ├── App.tsx               # Composant racine + routing
       ├── index.tsx             # Point d'entrée React
       ├── index.html            # Template HTML
       ├── vite.config.ts        # Config Vite (port 3000)
       ├── package.json          # Dépendances npm
       └── tsconfig.json         # Config TypeScript
```

---

## 🎨 Design System

Le frontend utilise le design original de jobfair-connect :

- **Couleur principale** : `#0d69f2` (bleu)
- **Background** : `#101722` (noir/bleu foncé)
- **Cards** : `#1E293B` avec effet glassmorphism
- **Police** : Plus Jakarta Sans
- **Icônes** : Material Symbols Outlined (Google)
- **Format** : Mobile-first (max-width 448px)
- **Effets** : Blobs animés en arrière-plan, blur effects

---

## 🐛 Debugging

### Le frontend ne charge pas ?

```bash
# Vérifier que Vite tourne
cd jobfair-connect
npm run dev

# Doit afficher : Local: http://localhost:3000
```

### Erreurs CORS ?

- Vérifier que Django tourne : http://localhost:8000/api/
- Vérifier les logs : `docker compose logs -f web`
- CORS est configuré pour `localhost:3000` et `localhost:5173`

### Les swipes ne fonctionnent pas ?

1. Ouvrir la console du navigateur (F12)
2. Vérifier que vous êtes connecté
3. Vérifier les cookies (DevTools > Application > Cookies)
4. Vérifier les logs Django : `docker compose logs -f web`

### Pas de données dans l'admin ?

1. Aller sur http://localhost:8000/admin/
2. **Cliquer sur les sections** (Étudiants, Entreprises, etc.)
3. Les données sont là, il faut juste cliquer pour les voir !

### Reset complet si rien ne marche

```bash
docker compose down -v
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py setup_demo
cd jobfair-connect && npm run dev
```

---

## 🔮 Prochaines Fonctionnalités (À Implémenter)

### Backend
- [ ] Système d'authentification JWT
- [ ] Upload de CV et photos de profil
- [ ] Algorithme de matching bipartite (NetworkX)
- [ ] Génération automatique du planning optimisé
- [ ] WebSockets pour notifications en temps réel
- [ ] Système de matching bidirectionnel (entreprises likent aussi)

### Frontend
- [ ] Page de connexion/inscription
- [ ] Upload de fichiers (CV, photo)
- [ ] Animations de swipe améliorées (gestures tactiles)
- [ ] Système de notifications push
- [ ] Chat avec les entreprises matchées
- [ ] Filtres et préférences de recherche

---

## 📊 Checklist de Vérification

Avant de coder, vérifiez que tout fonctionne :

- [ ] Docker Desktop est lancé
- [ ] Backend Django répond sur http://localhost:8000/api/
- [ ] Frontend React répond sur http://localhost:3000
- [ ] Je peux me connecter avec `etudiant@test.com` / `test123`
- [ ] Je vois 2 entreprises dans le swipe
- [ ] Je vois 1 entretien dans le Planning
- [ ] L'admin Django affiche les données sur http://localhost:8000/admin/

---

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commiter : `git commit -am 'Add feature'`
3. Pousser : `git push origin feature/ma-feature`
4. Créer une Pull Request

---

## 📄 Licence

Projet académique - Polytech Lyon 2025

---