# 🚀 Démarrage Rapide

Guide pour lancer **JobFair Connect** sur votre machine.

---

## 📋 Prérequis

1. **Docker Desktop** (doit être démarré)
2. **Node.js** v18+ ([télécharger](https://nodejs.org/))
3. **Git**

---

## 🎯 Installation (Première fois uniquement)

### 1. Cloner le projet

<details open>
<summary><b>🪟 PowerShell / CMD (Windows)</b></summary>

```powershell
git clone https://github.com/Albin0903/codev.git
cd codev
```
</details>

<details>
<summary><b>🐧 Bash (WSL / Linux / macOS)</b></summary>

```bash
git clone https://github.com/Albin0903/codev.git
cd codev
```
</details>

### 2. Démarrer le backend

**Les commandes Docker sont identiques sur tous les systèmes :**
```bash
docker compose up -d --build
```

### 3. Initialiser la base de données
```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py setup_demo
```
> ✅ Créé un compte test : `etudiant@test.com` / `test123`

### 4. Installer et lancer le frontend

**Ouvrir un nouveau terminal :**

<details open>
<summary><b>🪟 PowerShell / CMD (Windows)</b></summary>

```powershell
cd src\frontend
npm install
npm run dev
```
</details>

<details>
<summary><b>🐧 Bash (WSL / Linux / macOS)</b></summary>

```bash
cd src/frontend
npm install
npm run dev
```
</details>

**Application disponible sur :** http://localhost:3000

---

## 🔄 Usage Quotidien

### Démarrer le projet

**Terminal 1 - Backend :**
```bash
docker compose up -d
```

**Terminal 2 - Frontend :**

<details open>
<summary><b>🪟 PowerShell / CMD</b></summary>

```powershell
cd src\frontend
npm run dev
```
</details>

<details>
<summary><b>🐧 Bash (WSL / Linux)</b></summary>

```bash
cd src/frontend
npm run dev
```
</details>

### Arrêter le projet
```bash
docker compose down
```

---

## 🔑 Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `etudiant@test.com` | `test123` | Étudiant |
| `admin@test.com` | `admin123` | Admin |

---

## 💡 Commandes utiles

**Les commandes Docker sont identiques sur tous les systèmes :**

```bash
# Voir les logs du serveur
docker compose logs -f web

# Appliquer les nouvelles migrations
docker compose exec web python manage.py migrate

# Réinitialiser les données de démo
docker compose exec web python manage.py setup_demo

# Reset complet (⚠️ supprime la base de données)
docker compose down -v
```

---

## 🐛 Problèmes fréquents

**Erreur 500 au login ?**
```bash
docker compose exec web python manage.py migrate
```

**Port 3000 déjà utilisé ?**

<details open>
<summary><b>🪟 PowerShell</b></summary>

```powershell
# Trouver le processus
netstat -ano | findstr :3000
# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F

# OU utiliser npx
npx kill-port 3000
```
</details>

<details>
<summary><b>🐧 Bash (WSL / Linux)</b></summary>

```bash
# Tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill -9

# OU utiliser npx
npx kill-port 3000
```
</details>

**Docker ne démarre pas ?**
- Vérifier que Docker Desktop est lancé
- Redémarrer Docker Desktop

---

📖 **Documentation complète :** voir [README.md](README.md)
