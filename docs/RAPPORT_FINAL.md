# RAPPORT FINAL — Plateforme de campagne AEMA

> [COMMENTAIRE]

État du projet à l'issue de l'implémentation du backend, de la base de données
et de l'espace d'administration. Ce rapport suit le plan imposé par la consigne
(section 36). Aucun secret réel n'est reproduit ici : toutes les valeurs se
trouvent uniquement dans `backend/.env` (ignoré par Git).

---

## 1. ARCHITECTURE

### Diagramme (texte)

```
┌─────────────────────────┐         ┌──────────────────────────┐
│  FRONTEND — Vite/React  │  HTTP   │  BACKEND — Node/Express  │
│                         │────────▶│                          │
│  · Site public          │  JSON   │  · /health               │
│    (sections, formulaire│         │  · /api/messages (POST)  │
│    de contact)          │         │  · /api/admin/* (JWT)    │
│  · Espace admin         │◀────────│                          │
│    (/admin, caché)      │         └────────────┬─────────────┘
└─────────────────────────┘                      │  pg (pool)
                                                 ▼
                                   ┌───────────────────────────┐
                                   │  PostgreSQL — aema_campaign│
                                   │  · messages               │
                                   │  · admins                 │
                                   └───────────────────────────┘
```

### Tiers

| Tier | Technologie | Rôle |
|------|-------------|------|
| Frontend | React 19 + Vite 8 (noir / vert olive, sans framework CSS) | Site public + espace admin séparé |
| Backend | Node.js + Express 5 | API REST, validation, authentification |
| Base de données | PostgreSQL 18 (local) | Persistance `messages` et `admins` |

### Choix de conception

- **Deux tables seulement** (« votre projet ne nécessite pas plus de deux
  tables ») : `messages` et `admins`. Pas de sur-ingénierie (pas de
  pagination/filtres inutiles).
- Base de données et couche applicative **séparées** : `database/` contient le
  schéma et les scripts d'amorçage ; `backend/` l'API.
- **Rôle PostgreSQL dédié** (`aema_app`), propriétaire du schéma `public` :
  le superutilisateur n'est utilisé que hors exploitation (création base/rôle,
  init) et n'apparaît dans aucun fichier du projet.
- Frontend et backend sont **indépendants** (dossiers séparés, pas de monorepo).

---

## 2. BASE DE DONNÉES

Base : `aema_campaign` — encodage UTF8, PostgreSQL 18. Rôle applicatif :
`aema_app` (mot de passe aléatoire dans `backend/.env`, jamais commité).

### Tables

**`messages`** — messages envoyés depuis le formulaire public.

| Colonne      | Type                        | Contrainte                                    |
|--------------|-----------------------------|-----------------------------------------------|
| `id`         | BIGINT                      | `GENERATED ALWAYS AS IDENTITY`, PK            |
| `nom`        | VARCHAR(100)                | NOT NULL, `DEFAULT 'Anonyme'`                 |
| `email`      | VARCHAR(254)                | NOT NULL                                      |
| `message`    | TEXT                        | NOT NULL (limite 5000 caractères côté API)    |
| `statut`     | VARCHAR(10)                 | NOT NULL, `DEFAULT 'UNREAD'`, CHECK (UNREAD/READ) |
| `created_at` | TIMESTAMPTZ                 | NOT NULL, `DEFAULT now()`                     |
| `updated_at` | TIMESTAMPTZ                 | NOT NULL, `DEFAULT now()`                     |

Index : `(created_at DESC)`, `(statut)`.

**`admins`** — comptes administrateurs.

| Colonne         | Type         | Contrainte                         |
|-----------------|--------------|------------------------------------|
| `id`            | BIGINT       | `GENERATED ALWAYS AS IDENTITY`, PK |
| `email`         | VARCHAR(254) | NOT NULL, UNIQUE                   |
| `password_hash` | VARCHAR(100) | NOT NULL (hash bcrypt)             |
| `created_at`    | TIMESTAMPTZ  | NOT NULL, `DEFAULT now()`          |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL, `DEFAULT now()`          |
| `last_login`    | TIMESTAMPTZ  | NULL (mis à jour à chaque connexion) |

Index : `(email)`.

Trigger : fonction `set_updated_at()` appliquée aux deux tables sur
`BEFORE UPDATE` (mise à jour automatique de `updated_at`).

### Script brut (`database/schema.sql`)

```sql
-- ============================================================
-- Schéma de base de données — Plateforme de campagne AEMA
-- PostgreSQL 14+ recommandé. Ce fichier est rejouable (idempotent).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Table : messages (formulaire de contact public)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL DEFAULT 'Anonyme',
  email      VARCHAR(254) NOT NULL,
  message    TEXT         NOT NULL,
  statut     VARCHAR(10)  NOT NULL DEFAULT 'UNREAD'
             CHECK (statut IN ('UNREAD', 'READ')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_statut     ON messages (statut);

-- ------------------------------------------------------------
-- Table : admins (comptes administrateurs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

-- ------------------------------------------------------------
-- Mise à jour automatique de updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_updated_at ON messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
```

---

## 3. API PUBLIQUE

Base URL : `http://localhost:3000` (variable `PORT`).

| Méthode | Route              | Corps attendu                                   | Réponse succès |
|---------|--------------------|-------------------------------------------------|----------------|
| GET     | `/health`          | —                                               | 200            |
| POST    | `/api/messages`    | `{ nom, email, message }`                       | 201            |

### POST `/api/messages`

Validation (`middleware/validators.js`) :

- `nom` : requis, 1 à 100 caractères (défaut « Anonyme » si omis).
- `email` : requis, format email valide, max 254 caractères.
- `message` : requis, 5 à 5000 caractères (pas de troncature non contrôlée :
  le backend **rejette** au-delà de 5000).
- Normalisation : email en minuscules, `trim()` sur les champs texte.
- Insertion en base paramétrée (`INSERT ... VALUES ($1, $2, $3)`), aucune
  concaténation de chaînes.

Réponse succès (201) :

```json
{ "success": true, "message": "Votre message a bien été envoyé." }
```

Limites de débit applicables : **20 requêtes / 15 min / IP** (sur toute la route).

---

## 4. API ADMIN

Toutes les routes sous `/api/admin` — **sauf `login`** — sont protégées par le
middleware `requireAuth` (en-tête `Authorization: Bearer <token>`). Sans token
valide : **401**.

| Méthode | Route                                  | Description                        | Accès |
|---------|----------------------------------------|------------------------------------|-------|
| POST    | `/api/admin/login`                     | Connexion → token JWT              | public, limité à 10/15 min/IP |
| GET     | `/api/admin/messages`                  | Liste des messages (décroissant)   | JWT |
| GET     | `/api/admin/messages/:id`              | Détail d'un message                | JWT |
| PATCH   | `/api/admin/messages/:id/read`         | Marquer lu                         | JWT |
| PATCH   | `/api/admin/messages/:id/unread`       | Marquer non lu                     | JWT |
| DELETE  | `/api/admin/messages/:id`              | Supprimer un message               | JWT |

`GET /api/admin/messages` renvoie également `unreadCount` (nombre de non-lus) :

```json
{
  "success": true,
  "messages":   [ { "id": 3, "nom": "...", "email": "...", "statut": "UNREAD", "created_at": "..." } ],
  "unreadCount": 1
}
```

Cas d'erreur (format JSON cohérent, aucune stack trace) :

```json
{ "success": false, "error": { "message": "Message introuvable." } }
```

---

## 5. AUTHENTIFICATION

- **Méthode** : JWT (JSON Web Token, HMAC-SHA256 via `jsonwebtoken`).
- **Connexion** : `POST /api/admin/login` → comparaison du mot de passe avec
  `bcrypt.compare()` sur `password_hash` stocké en base.
- **Hashage** : `bcryptjs`, coût 10 (10 24) — aucun mot de passe en clair
  n'est stocké ni journalisé.
- **Expiration** : `JWT_EXPIRES_IN` (réglé à `8h`).
- **Protection contre la force brute** :
  - limiteur `express-rate-limit` à **10 tentatives / 15 min / IP** sur le login ;
  - réponse d'échec **générique** (« Email ou mot de passe incorrect. ») qui ne
    révèle pas si le compte existe.
- **Stockage côté client** : token conservé en `sessionStorage`
  (`aema_admin_token`), jamais dans un cookie, purgé à la déconnexion.
- **Transmission** : uniquement en en-tête `Authorization: Bearer`.
- **Ajout** : `last_login` mis à jour en base à chaque connexion réussie.
- Secret de signature : `JWT_SECRET` (64+ caractères aléatoires, `backend/.env`).

---

## 6. ADMIN

### Comment y accéder

- **Aucun lien public** : ni dans le menu, ni dans le pied de page, ni dans
  aucun composant du site. Vérifié par recherche de « admin » dans les sources
  publiques → présent uniquement dans `Admin.jsx`, `admin.css`, `main.jsx`.
- Accès uniquement par URL directe : `http://localhost:5173/admin`.
- Le routeur frontend (`main.jsx`) aiguille toute requête commençant par
  `/admin` vers `AdminApp`.

### Fonctionnement

1. Écran de connexion (email + mot de passe).
2. Tableau de bord : liste des messages (décroissant), badge de non-lus.
3. Détail d'un message (ouverture automatique lecture + passage en « lu »).
4. Actions : marquer lu / non lu, supprimer (avec boîte de confirmation).
5. Déconnexion (bouton) ; déconnexion automatique en cas de token expiré (401).

### Création du premier administrateur

```bash
cd backend
npm run seed:admin
```

Le script lit `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `backend/.env`, exige un
mot de passe d'au moins 12 caractères, refuse les valeurs type `CHANGE_ME`, et
est idempotent (ne duplique pas le compte).

---

## 7. VARIABLES `.ENV`

Fichier réel : `backend/.env` — **ignoré par Git** (règle `.gitignore` :
`.env`, `.env.*`, à l'exception de `!.env.example`). Le modèle commitable est
`backend/.env.example` (valeurs `CHANGE_ME` uniquement).

| Variable       | Rôle                                                    | Exemple (modèle)                          |
|----------------|---------------------------------------------------------|-------------------------------------------|
| `PORT`         | Port HTTP du serveur Express                            | `3000`                                    |
| `DATABASE_URL` | Connexion PostgreSQL (utilisateur applicatif dédié)     | `postgresql://aema_app:CHANGE_ME@127.0.0.1:5432/aema_campaign` |
| `FRONTEND_URL` | Origine(s) CORS autorisée(s), séparées par des virgules | `http://localhost:5173`                   |
| `JWT_SECRET`   | Secret de signature des tokens (longueur 64+)           | `CHANGE_ME`                               |
| `JWT_EXPIRES_IN` | Durée de validité des tokens                          | `8h`                                      |
| `ADMIN_EMAIL`  | Email du premier administrateur (`seed-admin`)          | `admin@example.com`                       |
| `ADMIN_PASSWORD` | Mot de passe du premier administrateur (≥ 12 car.)    | `CHANGE_ME`                               |

Frontend (`frontend/.env.example`) :

| Variable        | Rôle                                | Exemple |
|-----------------|-------------------------------------|---------|
| `VITE_API_URL`  | URL de base de l'API (surchargable) | `http://localhost:3000` |

Par défaut (si absente), le frontend utilise `http://localhost:3000`.

---

## 8. FICHIERS CRÉÉS

### Backend

```
backend/
├── .env                  (secret, ignoré par Git)
├── .env.example
├── package.json
└── src/
    ├── server.js
    ├── config/database.js
    ├── controllers/
    │   ├── adminController.js
    │   └── messageController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── errorHandler.js
    │   └── validators.js
    ├── routes/
    │   ├── adminRoutes.js
    │   └── messageRoutes.js
    └── utils/
        ├── asyncHandler.js
        └── errors.js

backend/tests/api.test.js
```

### Base de données

```
database/
├── schema.sql        (modélisation, idempotent)
├── init-db.js        (applique schema.sql)
└── seed-admin.js     (création du premier admin)
```

### Frontend

```
frontend/
├── .env.example
└── src/
    ├── Admin.jsx     (login + tableau de bord + gestion des messages)
    └── admin.css     (styles de l'espace admin)
```

### Documentation

```
docs/RAPPORT_FINAL.md   (ce document)
```

---

## 9. FICHIERS MODIFIÉS

| Fichier | Modification |
|---------|--------------|
| `frontend/src/main.jsx` | Routage : `/admin` → `AdminApp` |
| `frontend/src/sections/Contact.jsx` | Envoi du formulaire vers `POST /api/messages` + états idle/envoi/succès/erreur + libellé « E-mail (requis) » |
| `README.md` | Ajout : mise en place, API, tests |

Le reste du site public (App.jsx, Header, Footer, Hero, sections, index.css)
est volontairement inchangé : seules les fonctionnalités de contact ont été
branchées.

---

## 10. DÉPENDANCES AJOUTÉES

```bash
cd backend
npm install bcryptjs@^3.0.3 jsonwebtoken@^9.0.3 express-rate-limit@^8.7.0
```

Déjà présentes : `express`, `cors`, `dotenv`, `pg`, `nodemon`.
Aucune dépendance ajoutée au frontend.

---

## 11. COMMANDES À EXÉCUTER

### Prérequis (une seule fois)

1. Avoir PostgreSQL démarré (service Windows : `postgresql-x64-18`).
2. Créer la base et le rôle applicatif :

```bash
# psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
psql -U postgres -h 127.0.0.1 -c "CREATE ROLE aema_app LOGIN PASSWORD '<mot_de_passe>';"
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE aema_campaign OWNER aema_app ENCODING 'UTF8';"
```

> Ces étapes ont déjà été réalisées sur la machine pour le projet « réel ».
> Le rôle `aema_app` est propriétaire du schéma `public`
> (`ALTER SCHEMA public OWNER TO aema_app`), ce qui permet à `init-db.js`
> de créer les tables.

### Installation

```bash
cd backend  && npm install
cd frontend && npm install
```

### Initialisation de la base + admin

```bash
cd backend
npm run db:init      # applique database/schema.sql (idempotent)
npm run seed:admin   # crée le premier admin depuis backend/.env
```

### Démarrage

```bash
cd backend  && npm run dev     # http://localhost:3000
cd frontend && npm run dev     # http://localhost:5173
```

Vérifier `GET http://localhost:3000/health` · Admin à `http://localhost:5173/admin`.

### Tests / lint / build

```bash
cd backend  && npm run test:api
cd frontend && npm run lint && npm run build
```

---

## 12. TESTS EFFECTUÉS

Automatiques : smoke test bout-en-bout Node (`npm run test:api`) qui démarre
l'application Express sur un port éphémère, crée un admin temporaire, et couvre
17 scénarios — voir section 13 pour la liste.

Manuels (vérification réelle sur la machine) :

1. Serveur backend démarré → `GET /health` = `{"success":true,"message":"AEMA Election API fonctionne"}`.
2. Site public : `GET /` = 200 ; `GET /admin` = 200 (retourne la SPA).
3. Formulaire public réel → message inséré en base puis **vérifié directement
   dans PostgreSQL** via `psql` (requête `SELECT`).
4. Connexion réussie avec les identifiants réels → token obtenu (187 caractères).
5. Connexion avec mauvais mot de passe → 401.
6. `GET /api/admin/messages` sans token → 401 ; avec token → 200.
7. `PATCH /read` → statut passe de `UNREAD` à `READ` ; `DELETE` → 200.
8. Base laissée propre après les tests (0 message résiduel, 1 admin).

---

## 13. RÉSULTATS DES TESTS

```text
PASS  GET /health → 200
PASS  POST /api/messages valide → 201
PASS  Donnée réellement présente dans PostgreSQL
PASS  POST /api/messages email invalide → 400
PASS  POST /api/messages message vide → 400
PASS  POST login mauvais mot de passe → 401
PASS  Réponse de login générique (ne révèle pas le compte)
PASS  GET /api/admin/messages sans auth → 401
PASS  POST login bons identifiants → 200 + token
PASS  GET /api/admin/messages avec auth → 200
PASS  Le message inséré apparaît dans la liste
PASS  Le message inséré est en statut UNREAD
PASS  GET /api/admin/messages/:id → 200
PASS  PATCH /read → 200 + statut READ
PASS  PATCH /unread → 200 + statut UNREAD
PASS  DELETE /api/admin/messages/:id → 200
PASS  Message effectivement supprimé de PostgreSQL

Résultat : 17 réussi(s), 0 échec(s)
```

Frontend : `npm run lint` sans erreur, `npm run build` OK (36 modules,
dist généré).

---

## 14. INFORMATIONS RESTANTES À CONFIGURER

Avant une éventuelle mise en production :

1. **Changer le mot de passe `ADMIN_PASSWORD`** (et recréer le hash) — celui
   actuellement en `.env` est un mot de passe de développement.
2. **Régénérer `JWT_SECRET`** (64+ caractères aléatoires) si le `.env` a été
   partagé.
3. **`FRONTEND_URL`** : pointer vers le vrai domaine du frontend ; mettre à
   jour la liste si plusieurs origines.
4. **Fallback SPA pour `/admin`** : le serveur de production (ex. nginx)
   devra rediriger `/admin` vers `index.html`
   (`try_files $uri $uri/index.html /index.html;`) comme le fait déjà Vite en
   développement/preview.
5. **HTTPS/TLS** : le token transite en en-tête `Authorization` — exiger HTTPS.
6. **PostgreSQL** : méthode d'authentification déjà en `scram-sha-256` (aucun
   mot de passe en clair sur le réseau) ; en production, restreindre
   `pg_hba.conf` et le réseau d'écoute ; idéalement créer un utilisateur de
   rotation avec permissions limitées.
7. **Limiteurs** : ajuster les seuils (`300` global, `20` contact, `10` login)
   selon le trafic attendu.
8. **`JWT_EXPIRES_IN`** : réduire si 8 h paraît trop long pour l'usage prévu.

### Points conformes à la consigne (rappel)

- [x] Pas plus de deux tables, `messages` + `admins`.
- [x] Backend couches séparées : routes / contrôleurs / middleware / config.
- [x] `/health` toujours fonctionnel.
- [x] Formulaire public fonctionnel, sans changer la page Contact autrement.
- [x] Espace admin caché (aucun lien public, accès par `/admin`).
- [x] Authentification par token (JWT) + hash bcrypt.
- [x] Absence de secret en dur dans le code ; `.env` ignoré par Git.
- [x] Journalisation minimaliste : aucun mot de passe, aucune donnée sensible.
- [x] Mot de passe admin ≥ 12 caractères, refuse `CHANGE_ME`.
- [x] Email administratif dédié (`ADMIN_EMAIL`) en `.env`.

---

*Rapport final — projet AEMA election.*