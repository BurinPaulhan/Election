# AEMA Election

Application web de présentation de l'équipe candidate
à l'élection de l'Association des Étudiants Malagasy en Algérie (AEMA).

## Structure

- `frontend/` — Interface utilisateur
- `backend/` — API et logique métier
- `database/` — Base de données PostgreSQL
- `docs/` — Documentation du projet (voir `docs/PRODUCTION.md` pour la mise en ligne)

## Technologies

### Frontend
- React
- Vite

### Backend
- Node.js
- Express

### Base de données
- PostgreSQL

## Mise en place

### 1. Installation des dépendances

```bash
cd backend && npm install
cd frontend && npm install
```

### 2. Configuration

Créer `backend/.env` à partir de `backend/.env.example` :

```bash
cd backend
cp .env.example .env
```

Renseigner dans `backend/.env` :

- `DATABASE_URL` — connexion PostgreSQL (utilisateur applicatif, jamais le superutilisateur)
- `JWT_SECRET` — secret de signature des tokens (valeur aléatoire longue)
- `ADMIN_EMAIL` et `ADMIN_PASSWORD` — identifiants du premier administrateur

Le fichier `.env` est ignoré par Git. Ne jamais le committer.

### 3. Initialiser la base de données

Créer la base puis exécuter le schéma :

```bash
cd backend
npm run db:init   # applique database/schema.sql
```

### 4. Créer le premier administrateur

```bash
cd backend
npm run seed:admin   # lit ADMIN_EMAIL / ADMIN_PASSWORD dans backend/.env
```

### 5. Démarrer le backend

```bash
cd backend
npm run dev   # http://localhost:3000
```

Vérification : `GET http://localhost:3000/health`

### 6. Démarrer le frontend

```bash
cd frontend
npm run dev   # http://localhost:5173
```

### 7. Espace d'administration

L'espace admin est volontairement invisible dans le site public. Il est accessible
uniquement par son URL :

```
http://localhost:5173/admin
```

Pour toute mise en production, le serveur web doit rediriger la route `/admin`
vers `index.html` (fallback SPA, ex. `try_files` sous nginx).

## API

### Publique

| Méthode | Route            | Description                    |
|---------|------------------|--------------------------------|
| GET     | `/health`        | État du service                |
| POST    | `/api/messages`  | Formulaire de contact public   |

### Administration (protégée par JWT, sauf `login`)

| Méthode | Route                          | Description                  |
|---------|--------------------------------|------------------------------|
| POST    | `/api/admin/login`             | Connexion administrateur     |
| GET     | `/api/admin/messages`          | Liste des messages           |
| GET     | `/api/admin/messages/:id`      | Détail d'un message          |
| PATCH   | `/api/admin/messages/:id/read` | Marquer lu                   |
| PATCH   | `/api/admin/messages/:id/unread` | Marquer non lu             |
| DELETE  | `/api/admin/messages/:id`      | Supprimer un message         |

## Tests

```bash
cd backend
npm run test:api        # smoke test bout-en-bout (17 scénarios)
cd frontend
npm run lint && npm run build
```