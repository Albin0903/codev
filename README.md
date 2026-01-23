# 📱 JobFair Connect

Application de matching entre **étudiants** et **entreprises** pour les forums de recrutement.  
Système de swipe bidirectionnel inspiré de Tinder.

---

## 🚀 Démarrage Rapide

### Prérequis
- **Docker Desktop** (lancé)
- **Node.js** v18+

### Installation (Première fois)

```bash
# 1. Cloner le projet
git clone https://github.com/Albin0903/codev.git
cd codev

# 2. Lancer le backend (Django + PostgreSQL)
docker compose up -d --build

# 3. Initialiser la base de données
docker compose exec web python manage.py migrate
docker compose exec web python manage.py setup_demo

# 4. Lancer le frontend (dans un nouveau terminal)
cd src/frontend
npm install
npm run dev
```

### ✅ Accès

| Service | URL | Identifiants |
|---------|-----|--------------|
| **App Étudiant** | http://localhost:3000 | `marie.dupont` / `test123` |
| **App Entreprise** | http://localhost:3000 | `innovatech` / `test123` |
| **Admin Django** | http://localhost:8000/admin/ | `admin` / `admin123` |

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   PostgreSQL    │
│   React + Vite  │     │   Django + DRF  │     │   Docker        │
│   Port 3000     │     │   Port 8000     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Stack Technique

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | Django 5.2, Django REST Framework |
| **Database** | PostgreSQL 15 (Docker) |
| **Auth** | Token Authentication (sessionStorage) |

---

## 📂 Structure du Projet

```
codev/
├── docker-compose.yml          # Orchestration Docker
├── Dockerfile                  # Image Django
├── requirements.txt            # Dépendances Python
├── README.md                   # Ce fichier (documentation complète)
│
└── src/
    ├── manage.py               # CLI Django
    │
    ├── backend/                # Configuration Django
    │   ├── settings.py         # Paramètres (DB, CORS, DRF)
    │   └── urls.py             # Routes principales
    │
    ├── core/                   # Application principale
    │   ├── models.py           # Modèles de données
    │   ├── serializers.py      # Sérialiseurs DRF
    │   ├── permissions.py      # Règles de permissions personnalisées
    │   ├── api_views.py        # Vues API étudiants
    │   ├── api_views_company.py# Vues API entreprises
    │   ├── api_urls.py         # Routes API
    │   ├── admin.py            # Interface admin personnalisée
    │   └── management/commands/
    │       ├── setup_demo.py   # Génère données de démo
    │       └── reset_db.py     # Reset base de données
    │
    ├── frontend/               # Application React
    │   ├── App.tsx             # Routing & composant racine
    │   ├── index.tsx           # Point d'entrée
    │   ├── index.html          # Template HTML
    │   ├── pages/              # Écrans de l'application
    │   │   ├── LoginScreen.tsx
    │   │   ├── SwipeScreen.tsx        # Swipe étudiant
    │   │   ├── CompanySwipeScreen.tsx # Swipe entreprise
    │   │   ├── MatchScreen.tsx        # Célébration match
    │   │   ├── ProfileScreen.tsx      # Profil étudiant
    │   │   ├── CompanyProfileScreen.tsx
    │   │   ├── ScheduleScreen.tsx     # Planning étudiant
    │   │   ├── CompanyScheduleScreen.tsx
    │   │   └── CompanyMatchesScreen.tsx
    │   ├── components/
    │   │   ├── BackgroundBlobs.tsx    # Effets visuels
    │   │   └── BottomNavigation.tsx   # Barre de navigation
    │   ├── services/
    │   │   └── api.ts          # Client API
    │   ├── public/
    │   │   └── favicon.svg     # Icône
    │   └── vite.config.ts      # Config Vite (port 3000)
    │
    ├── media/                  # Fichiers uploadés (CV, photos)
    └── templates/              # Templates Django (admin)
```

---

## 🧩 Modèles de Données

### Utilisateurs
- **User** : Authentification Django (username, password)
- **Student** : Profil étudiant (école, formation, compétences, CV, photo)
- **Company** : Profil entreprise (secteur, description, logo, offres)

### Interactions
- **Swipe** : Action étudiant → entreprise (like/pass)
- **CompanySwipe** : Action entreprise → étudiant (like/pass)
- **Match** : Créé automatiquement quand les deux ont liké mutuellement
- **Interview** : Entretien planifié suite à un match
- **InternshipOffer** : Offres de stage d'une entreprise

### Relations
```
Student ←──── Swipe ────→ Company
    ↑                        ↑
    └── CompanySwipe ────────┘
            ↓
          Match (si mutuel)
            ↓
        Interview
```

---

## 🔌 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/login/` | Connexion (retourne token) |
| `POST` | `/api/logout/` | Déconnexion |

### Étudiants
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET/PATCH` | `/api/me/` | Profil étudiant connecté |
| `POST` | `/api/cv/` | Upload CV (multipart/form-data) |
| `GET` | `/api/companies/` | Liste des entreprises |
| `GET` | `/api/companies/next_card/` | Prochaine entreprise à swiper |
| `POST` | `/api/swipes/` | Swiper sur une entreprise |
| `GET` | `/api/matches/` | Matchs mutuels |
| `GET` | `/api/interviews/` | Entretiens planifiés |

### Entreprises
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET/PATCH` | `/api/company/me/` | Profil entreprise connectée |
| `GET` | `/api/company/students/` | Liste des étudiants |
| `GET` | `/api/company/students/next_card/` | Prochain étudiant à swiper |
| `POST` | `/api/company/swipes/` | Swiper sur un étudiant |
| `GET` | `/api/company/matches/` | Matchs mutuels |
| `GET` | `/api/company/interviews/` | Entretiens planifiés |
| `GET/POST` | `/api/company/offers/` | Offres de stage |

---

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification
- [x] Page de connexion (étudiants et entreprises)
- [x] Token authentication (sessionStorage)
- [x] Détection automatique du type d'utilisateur (Student/Company)
- [x] Déconnexion

### 👤 Profil Étudiant
- [x] Affichage des informations personnelles
- [x] Modification du profil (nom, école, compétences, langues, loisirs)
- [x] Upload de CV (PDF/Word, max 5MB)
- [x] Visibilité de la photo configurable

### 🏢 Profil Entreprise
- [x] Affichage des informations
- [x] Modification du profil
- [x] Gestion des offres de stage

### 🔄 Système de Swipe
- [x] Swipe étudiant → entreprises
- [x] Swipe entreprise → étudiants
- [x] Animations de swipe (gauche/droite)
- [x] Modal "Voir plus" pour détails complets
- [x] État vide élégant quand plus de profils

### 💝 Matching Bidirectionnel
- [x] Match créé uniquement si les deux parties ont liké
- [x] Écran de célébration dynamique
- [x] Liste des matchs (étudiants et entreprises)

### 📅 Planning
- [x] Affichage des entretiens planifiés
- [x] Vue agenda pour étudiants et entreprises

### ⚙️ Administration
- [x] Interface admin Django personnalisée
- [x] Bouton reset base de données
- [x] Commande `setup_demo` pour données de test

---

## 🔒 Sécurité & Permissions

### 🛡️ Architecture de Sécurité

#### 1. Authentification
- **Type** : Token Authentication (Django REST Framework)
- **Stockage** : sessionStorage (non persistant, multi-onglet sûr)
- **Headers** : `Authorization: Token <token>`

#### 2. Permissions par Rôle

**Étudiants :**
- ✅ Voir/Modifier SON profil
- ✅ Swiper sur entreprises
- ✅ Voir SES matchs et entretiens
- ❌ Voir/Modifier profil d'autres étudiants
- ❌ Swiper au nom d'un autre

**Entreprises :**
- ✅ Voir/Modifier SON profil
- ✅ Swiper sur étudiants
- ✅ Voir SES matchs et entretiens
- ❌ Voir/Modifier profil d'autres entreprises
- ❌ Swiper au nom d'une autre

#### 3. Isolation des Données (Data Isolation)

Chaque utilisateur ne peut voir/modifier que **SES PROPRES DONNÉES**.

```python
# Exemple : Impossible de modifier le profil de quelqu'un d'autre
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def current_user(request):
    student = request.user.student  # Toujours l'utilisateur connecté
    if student.user != request.user:
        return Response({'error': 'Forbidden'}, status=403)
```

#### 4. Protections en Place

| Protection | Détail |
|-----------|--------|
| ❌ **Modification profil d'autre** | Impossible - `CanOnlyModifyOwnData` |
| ❌ **Swipe au nom d'un autre** | Impossible - vérification propriété |
| ❌ **Voir swipes d'une autre entreprise** | Impossible - filtre utilisateur |
| ✅ **CV Upload validé** | Type MIME, max 5MB |
| ✅ **Reset BD en production** | Désactivé - `DEBUG=False` |
| ✅ **Direction swipe validée** | Doit être 'left' ou 'right' |

---

## ⚡ Commandes Utiles

### Docker (Backend)
```bash
docker compose up -d              # Démarrer
docker compose down               # Arrêter
docker compose logs -f web        # Voir les logs
docker compose restart            # Redémarrer
docker compose down -v            # Reset complet (supprime la BDD)
```

### Django
```bash
docker compose exec web python manage.py migrate          # Migrations
docker compose exec web python manage.py setup_demo       # Données de démo
docker compose exec web python manage.py createsuperuser  # Créer admin
docker compose exec web python manage.py shell            # Shell Python
```

### Frontend
```bash
cd src/frontend
npm install           # Installer dépendances
npm run dev           # Serveur de dev (port 3000)
npm run build         # Build production
```

---

## 🎨 Design System

| Élément | Valeur |
|---------|--------|
| **Couleur primaire** | `#0d69f2` (bleu) |
| **Background** | `#101722` (noir/bleu foncé) |
| **Cards** | `#1E293B` avec glassmorphism |
| **Police** | Plus Jakarta Sans |
| **Icônes** | Material Symbols Outlined |
| **Format** | Mobile-first (max 448px) |

---

## 🔮 Prochaines Étapes (TODO)

### Priorité Haute
- [ ] Notifications push pour nouveaux matchs
- [ ] Chat/messagerie entre matchs
- [ ] Planification d'entretiens depuis l'app
- [ ] JWT avec expiration (remplacer tokens permanents)
- [ ] Audit logging (enregistrer les actions)

### Priorité Moyenne
- [ ] Filtres de recherche (compétences, secteur)
- [ ] Algorithme de recommandation
- [ ] Statistiques pour les entreprises
- [ ] Rate limiting (protection contre les abus)
- [ ] Tests de sécurité automatisés

### Priorité Basse
- [ ] Mode sombre/clair
- [ ] PWA (installation mobile)
- [ ] Export des données (CSV)

---

## 🐛 Dépannage

### Frontend ne charge pas
```bash
cd src/frontend && npm run dev
# Doit afficher : Local: http://localhost:3000
```

### Erreurs CORS
- Vérifier que Django tourne : `docker compose logs -f web`
- CORS configuré pour `localhost:3000` et `localhost:3001`
- S'assurer que le backend répond : `curl http://localhost:8000/api/`

### Backend ne démarre pas
```bash
docker compose logs web  # Voir les erreurs
docker compose down -v   # Reset complet
docker compose up -d --build  # Redémarrer
```

### Reset complet
```bash
docker compose down -v
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py setup_demo
cd src/frontend && npm run dev
```

---

## 📄 Licence

Projet académique - Polytech Lyon 2025
