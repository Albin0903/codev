## 🗄️ Base de Données

Ce projet utilise **PostgreSQL** pour la persistance des données. L'architecture a été conçue pour gérer efficacement la relation triangulaire entre les entreprises, les offres d'emploi et les candidats, avec un système de gestion des entretiens et de priorisation des profils.

### 🛠️ Script de Création (SQL)

Exécutez ces blocs dans l'ordre pour initialiser la base de données.

#### Étape 1 : Nettoyage & Tables Principales

Création des entités `Entreprise`, `Offre` et `Candidat`.

```sql
-- Nettoyage préventif
DROP TABLE IF EXISTS entretien, preference_candidat, offre, candidat, entreprise;

-- 1. Table ENTREPRISE
CREATE TABLE entreprise (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    logo_url VARCHAR(255),
    contact_email VARCHAR(150) NOT NULL UNIQUE, -- Identifiant de connexion
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table OFFRE
CREATE TABLE offre (
    id SERIAL PRIMARY KEY,
    intitule VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entreprise_id INT NOT NULL,
    CONSTRAINT fk_offre_entreprise
        FOREIGN KEY (entreprise_id) REFERENCES entreprise(id) ON DELETE CASCADE
);

-- 3. Table CANDIDAT
CREATE TABLE candidat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    niveau VARCHAR(50),
    cv_url VARCHAR(255),
    email VARCHAR(150) NOT NULL UNIQUE, -- Identifiant de connexion
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Étape 2 : Tables de Liaison & Fonctionnalités

Création des liens entre les entités et intégration de la **gestion des priorités**.

```sql
-- 4. Table ENTRETIEN (Cœur du système)
-- Relie un candidat à une offre et permet à l'entreprise de définir une priorité.
CREATE TABLE entretien (
    id SERIAL PRIMARY KEY,
    candidat_id INT NOT NULL,
    offre_id INT NOT NULL,

    -- ★ FEATURE : Permet de marquer un candidat comme 'Top Profil' pour cette offre
    est_prioritaire BOOLEAN DEFAULT FALSE,

    date_entretien TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'en_attente', -- ex: planifié, validé, rejeté
    notes_recruteur TEXT,

    CONSTRAINT fk_ent_candidat FOREIGN KEY (candidat_id) REFERENCES candidat(id) ON DELETE CASCADE,
    CONSTRAINT fk_ent_offre FOREIGN KEY (offre_id) REFERENCES offre(id) ON DELETE CASCADE
);

-- 5. Table PREFERENCE_CANDIDAT
-- Permet au candidat de classer ses offres favorites.
CREATE TABLE preference_candidat (
    candidat_id INT NOT NULL,
    offre_id INT NOT NULL,
    rang INT,
    PRIMARY KEY (candidat_id, offre_id),
    CONSTRAINT fk_pref_candidat FOREIGN KEY (candidat_id) REFERENCES candidat(id) ON DELETE CASCADE,
    CONSTRAINT fk_pref_offre FOREIGN KEY (offre_id) REFERENCES offre(id) ON DELETE CASCADE
);
```

#### Étape 3 : Injection de Données de Test (Seed)

Exécutez ce script pour peupler la base avec des entreprises, des candidats et des simulations d'entretiens.

```sql
-- 1. Création de deux entreprises
INSERT INTO entreprise (nom, contact_email, mot_de_passe_hash, adresse) VALUES
('Tech Solutions', 'recrutement@techsol.com', 'hash_secret_123', '10 Rue de la Paix, Paris'),
('Green Energy', 'rh@greenenergy.fr', 'hash_secret_456', '45 Avenue de la République, Lyon');

-- 2. Création de candidats
INSERT INTO candidat (nom, prenom, email, mot_de_passe_hash, niveau) VALUES
('Dupont', 'Alice', 'alice.dupont@mail.com', 'hash_user_1', 'Senior'),
('Martin', 'Bob', 'bob.martin@mail.com', 'hash_user_2', 'Junior');

-- 3. Création d'offres (Liées aux entreprises créées au dessus - IDs 1 et 2)
INSERT INTO offre (intitule, description, entreprise_id) VALUES
('Développeur Fullstack JS', 'Nous cherchons un expert React/Node.', 1), -- Offre ID 1 (Tech Solutions)
('Data Analyst', 'Analyse de données environnementales.', 2);      -- Offre ID 2 (Green Energy)

-- 4. Création de scénarios d'entretiens
INSERT INTO entretien (candidat_id, offre_id, date_entretien, statut, est_prioritaire, notes_recruteur) VALUES
-- Alice postule chez Tech Solutions : Elle est marquée comme PRIORITAIRE (Coup de cœur)
(1, 1, '2023-11-15 14:00:00', 'validé', TRUE, 'Excellent profil technique, à embaucher rapidement.'),

-- Bob postule chez Green Energy : Candidature standard
(2, 2, '2023-11-20 10:00:00', 'en_attente', FALSE, 'Profil intéressant mais manque d''expérience.');

-- 5. Préférences des candidats
INSERT INTO preference_candidat (candidat_id, offre_id, rang) VALUES
(1, 1, 1); -- Alice préfère l'offre Tech Solutions en rang 1
```

### 🚀 Démarrage rapide

1. Assurez-vous d'avoir **PostgreSQL** installé.
2. Connectez-vous : `psql -U postgres`
3. Créez la base : `CREATE DATABASE recrutement_db;`
4. Copiez les scripts SQL ci-dessus dans votre terminal SQL.
