# Système de Matching Prioritaire

Ce document explique les modifications apportées pour implémenter un système de matching prioritaire entre étudiants et entreprises dans l'application **JobFair Connect**.

---

## Objectif

Le système de matching permet de proposer aux étudiants des offres d'emploi triées par priorité dans leur écran de swipe. Les priorités sont calculées en fonction des caractéristiques communes entre les étudiants et les entreprises, ainsi que des interactions (likes).

---

## Fonctionnement

### 1. **Backend**

#### Endpoint API : `/api/prioritized_offers/`
- **But** : Retourner les offres d'emploi triées par priorité pour l'étudiant connecté.
- **Logique (version actuelle)** :
  - Retourne une liste d'entreprises classées avec un `score` simple basé sur les swipes existants pour l'étudiant connecté.
  - `score` = +1 si l'étudiant a liké l'entreprise +2 si l'entreprise a liké l'étudiant.
  - Si l'utilisateur n'est pas authentifié (ou n'est pas un étudiant), l'endpoint renvoie `[]`.
- **Code** : Implémenté dans `api_views.py`.

---

### 2. **Frontend**

#### Service API : `getPrioritizedOffers`
- **But** : Appeler l'endpoint `/api/prioritized_offers/` pour récupérer les offres triées.
- **Code** : Ajouté dans `services/api.ts`.

#### Écran de Swipe
- **Remarque importante (version actuelle)** :
  - L'écran de swipe récupère la carte via `api.getNextCompany()`.
  - L'appel à `getPrioritizedOffers()` existe, mais n'ordonne pas directement les cartes swipées tant que `next_card` n'utilise pas cette priorité.

---

## Étapes d'Implémentation

1. **Backend** :
  - Ajouter / maintenir l'endpoint API dans `api_views.py`.
  - (Optionnel) améliorer la logique de scoring pour refléter la pertinence des offres.

2. **Frontend** :
   - Ajouter une méthode API dans `services/api.ts`.
  - (Optionnel) brancher la priorisation côté `next_card` pour influencer l'ordre des cartes.

---

## Résultat Attendu

- Les étudiants voient en priorité les offres les plus pertinentes dans leur écran de swipe.
- Le système est extensible pour ajouter d'autres critères de matching à l'avenir.

---

## Commandes Utiles

### Lancer le Backend
```bash
docker compose up -d
```

### Lancer le Frontend
```bash
cd src/frontend
npm run dev
```

## Mise à jour : Configuration CORS

### Backend
- Ajout de la configuration CORS dans `settings.py` pour permettre les requêtes entre le frontend et le backend.

```python
# Configuration CORS
CORS_ALLOW_ALL_ORIGINS = True  # Permet toutes les origines pour le développement
# Vous pouvez restreindre cela en production avec CORS_ORIGIN_WHITELIST
```

### Résolution de problème
- Cette modification corrige les erreurs "Failed to fetch" causées par des restrictions CORS.

---

## Mise à jour : Ajout de logs dans login_view

### Backend
- Ajout de logs dans la fonction `login_view` pour capturer les étapes et les erreurs lors de la connexion.
- Les logs incluent :
  - Les données reçues dans la requête.
  - Les étapes de recherche d'utilisateur (email ou username).
  - Les résultats de l'authentification.
  - Les réponses envoyées ou les erreurs rencontrées.

### Résolution de problème
- Ces logs permettront de mieux comprendre pourquoi la connexion échoue.

---

## Mise à jour : Ajout de logs détaillés dans login_view

### Backend
- Ajout de logs supplémentaires dans la fonction `login_view` pour suivre les étapes importantes :
  - Début de la fonction.
  - Données reçues dans la requête.
  - Tentatives de connexion (email ou username).
  - Résultats de l'authentification.
  - Génération de token.
  - Identification du type d'utilisateur (étudiant ou entreprise).
  - Réponse envoyée ou erreur rencontrée.

### Résolution de problème
- Ces logs permettront de suivre chaque étape du processus de connexion et d'identifier précisément où se situe le problème.

---

## Tests et données de démonstration du matching

Pour tester le système de matching, les éléments suivants ont été ajoutés :

### 1. Commande Django `test_matching`
- Fichier : `src/core/management/commands/test_matching.py`
- Permet de générer des étudiants et entreprises fictifs, d'exécuter l'algorithme de matching et d'afficher les résultats dans les logs.
- Utilisation :
```bash
docker compose exec web python manage.py test_matching
```

### 2. Modèle `Match`
- Fichier : `src/core/models.py`
- Permet d'enregistrer les associations entre étudiants et entreprises (et si le match est mutuel).

---

## Générer de nouvelles offres (pour tester)

Il y a 4 façons simples de créer des offres `InternshipOffer`.

### Option A — Utiliser `setup_demo` (base de démo)
Cette commande crée déjà quelques offres “fixes”.

```bash
docker compose exec web python manage.py setup_demo
```

### Option B — Django Admin (manuel)
1) Ouvrir http://localhost:8000/admin/
2) Se connecter (ex: `admin` / `admin123`)
3) Ajouter une **Offre de stage** et choisir l'entreprise

### Option C — Génération automatique (recommandé pour en faire beaucoup)
Commande : `seed_offers`

```bash
# 5 offres par entreprise
docker compose exec web python manage.py seed_offers

# 20 offres par entreprise (reproductible)
docker compose exec web python manage.py seed_offers --count 20 --seed 123

# seulement pour une entreprise (username ou nom)
docker compose exec web python manage.py seed_offers --company innovatech --count 10
```

### Option D — API (si tu veux tester le front)
Endpoint (côté entreprise) : `POST /api/company/offers/`

Exemple minimal :
```bash
curl -X POST http://localhost:8000/api/company/offers/ \
  -H "Authorization: Token <TOKEN_ENTREPRISE>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Stage Fullstack","description":"...","location":"Lyon","duration":"6 mois","requirements":"Python, React"}'
```

### 3. Fonction `simple_match`
- Fichier : `src/core/services.py`
- Calcule un score simple en utilisant :
  - Les compétences de l'étudiant (recherchées dans le texte des offres de l'entreprise : `title`, `requirements`, `description`, `location`).
  - Un bonus si la localisation de l'étudiant correspond à l'adresse de l'entreprise (ou à la localisation d'une offre).

### 4. Documentation
- Ce README a été mis à jour pour décrire le processus de test.

---

## Étapes suivantes
- Redémarrer le serveur backend pour appliquer les modifications :

```bash
docker compose restart
```

- Tester la connexion et vérifier les logs pour identifier les éventuelles erreurs.