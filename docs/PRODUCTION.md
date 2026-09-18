# PRODUCTION — Déploiement en ligne (guide pratique)

> Récapitulatif complet des étapes de mise en ligne de la plateforme AEMA,
> avec les raisons de chaque choix. Aucun secret réel n'est reproduit ici
> (mots de passe, JWT, connection strings) : ils vivent uniquement dans
> `backend/.env` (local) et dans les dashboards Render / Neon / Vercel.

---

## 1. ARCHITECTURE EN LIGNE

```
                    ┌─────────────────────────────┐
  Visiteur ───────▶ │  VERCEL  (statique, CDN)    │
                    │  https://campagneaema.vercel.app
                    └──────────────┬──────────────┘
                                   │  HTTPS (fetch /api)
                                   ▼
                    ┌─────────────────────────────┐
                    │  RENDER  (API Node/Express) │
                    │  https://campaignaema.onrender.com
                    └──────────────┬──────────────┘
                                   │  pg Client (pool, SSL)
                                   ▼
                    ┌─────────────────────────────┐
                    │  NEON  (PostgreSQL géré)    │
                    │  connexion : …neon.tech/…   │
                    └─────────────────────────────┘
```

| Brique | Hébergeur | Rôle |
|--------|-----------|------|
| Frontend React/Vite | Vercel | Pages servies au visiteur (CDN mondial, HTTPS auto) |
| Backend Node/Express | Render | API publique + administration |
| PostgreSQL | Neon | Persistance (`messages`, `admins`), partagée entre env |
| Keep-alive | cron-job.org | Maintient l'instance Render éveillée (plan gratuit) |

## 2. POURQUOI CES OUTILS

| Outil | Pourquoi |
|-------|----------|
| **Vercel** | Meilleur hébergement statique gratuit : CDN, SSL automatique, déploiement Git/CLI. Le frontend n'a pas besoin d'un serveur applicatif. |
| **Render** | Héberge un **processus Node** (l'API). Plan gratuit ; auto-deploy depuis GitHub ; health check `/health`. |
| **Neon** | Postgres **géré dans le cloud** : l'instance Render est éphémère (plan gratuit), la donnée doit vivre ailleurs et être accessible en SSL. |
| **cron-job.org** | Le plan gratuit Render **endort** l'instance après ~15 min sans trafic → cold start lente/échouée. Un ping toutes les 10 min la garde chaude. |

## 3. MISE EN PLACE (dans l'ordre)

### 3.1 Neon — la base

1. Créer un projet sur https://console.neon.tech.
2. Copier la **connection string** (bouton Connect → psql). Préférer l'endpoint
   **direct** (sans `-pooler`) et ne pas ajouter `channel_binding=require`
   (paramètre non géré par `pg`). Forme :
   `postgresql://USER:MDP@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
3. Initialiser le schéma **et** l'admin **en pointant Neon** (depuis `backend/`) :
   ```bash
   # git-bash / Linux / macOS  —  Powershell : $env:DATABASE_URL = '…'
   export DATABASE_URL='postgresql://…'      # NE PAS coller ce secret dans un chat
   npm run db:init                            # crée messages + admins
   npm run seed:admin                         # crée ADMIN_EMAIL / ADMIN_PASSWORD
   unset DATABASE_URL
   ```
   > ⚠️ `db:init` et `seed:admin` lisent `backend/.env` si `DATABASE_URL` n'est
   > pas déjà défini : sans la variable posée, ils touchent la base **locale**.
   > Dotenv ne remplace jamais une variable déjà existante dans l'environnement.

### 3.2 Render — l'API

1. **New → Web Service** → connecter le repo GitHub, branche `main`.
2. Root Directory : `backend` — Build : `npm install` — Start : `npm start`.
3. Variables d'environnement :
   - `DATABASE_URL` (chaîne Neon actuelle) — **Secret**
   - `JWT_SECRET` (longue chaîne aléatoire) — **Secret**
   - `JWT_EXPIRES_IN` = `8h` — **Plain**
   - `FRONTEND_URL` = `https://campagneaema.vercel.app` — **Plain**
   - (facultatif pour seed) `ADMIN_EMAIL`, `ADMIN_PASSWORD` — **Secret**
4. Health check path : `/health`.
5. URL réelle du service : **`https://campaignaema.onrender.com`**
   (toujours vérifier le nom exact — un nom inventé = erreurs mystérieuses).
6. Activer **Auto-Deploy** (Settings) pour que chaque push redéploie.
7. **Keep-alive** (cron-job.org, gratuit) : job `GET https://campaignaema.onrender.com/health`
   toutes les 10 minutes.

### 3.3 Vercel — le frontend

1. Importer le repo GitHub (projet `camagne_aema`).
2. Root Directory : `frontend` — Build : `vite build` — Output : `dist`.
3. `frontend/vercel.json` (commité) — fallback SPA pour `/admin` :
   ```json
   { "rewrites": [{ "source": "/admin/:path*", "destination": "/index.html" }] }
   ```
4. URL de l'API : définie par priorité décroissante →
   (a) variable `VITE_API_URL` du dashboard Vercel ⚠️ (écrase tout),
   (b) `frontend/.env.production` (commité),
   (c) fallback **en dur** dans le code (`Admin.jsx`, `Contact.jsx`).
   → En production finale, **aucune variable `VITE_API_URL` dans le dashboard** ;
   le fallback du code garantit la bonne URL.
5. Déploiement : `git push` (auto) **ou** CLI : `npx vercel --prod`
   (à lancer depuis la **racine du repo**, Root Directory gérant `frontend`).

## 4. PROBLÈMES RENCONTRÉS (et leçons)

| Symptôme | Cause | Correctif |
|----------|-------|-----------|
| « Bloqué par CORS » (même avec API saine) | URL API **fantôme** dans le frontend → 404 sans header CORS | Corriger l'URL du bundle |
| Préflight OPTIONS → 404 sans `Access-Control-Allow-Origin` | Origine non autorisée par le middleware `cors` | Autoriser `*.vercel.app` + origines listées + callback |
| Login → 500 « erreur interne » | Table `admins` absente dans la base de prod | `db:init` + `seed:admin` **sur la bonne base** |
| `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` en logs | `trust proxy` non activé (proxy Render) | `app.set("trust proxy", 1)` |
| L'ancien site reste servi après redéploiement | Cache CDN Vercel / navigateur | **Purge Cache** (Settings → Caching) + **Ctrl+Shift+R** |
| Variable d'env « qui écrase tout » | `VITE_API_URL` restée dans le dashboard Vercel | La supprimer du dashboard |
| Message envoyé mais absent de l'admin en ligne | Envoyé depuis `localhost` → base **locale**, pas Neon | Tester depuis le site **en ligne** |

## 5. VÉRIFICATIONS (chaines de confiance)

```bash
# 1) L'API répond
curl https://campaignaema.onrender.com/health
# → {"success":true,...}

# 2) CORS préflight OK depuis l'origine Vercel
curl -i -X OPTIONS https://campaignaema.onrender.com/api/admin/login \
  -H "Origin: https://campagneaema.vercel.app" -H "Access-Control-Request-Method: POST"
# → HTTP/1.1 204 + access-control-allow-origin: https://campagneaema.vercel.app

# 3) Le bundle servi par Vercel contient la bonne URL
curl -s https://campagneaema.vercel.app/ | grep -o '/assets/index-[^"]*\.js'
# → nouveau nom hashé ; le fichier doit contenir campaignaema.onrender.com

# 4) /admin rendu (fallback SPA)
curl -s -o /dev/null -w "%{http_code}" https://campagneaema.vercel.app/admin
# → 200
```

## 6. SÉCURITÉ

- `backend/.env` est **gitignoré** ; ne jamais committer de secret.
- Tout secret passé dans un chat est **à considérer fuité** → régénérer :
  - mot de passe Neon (Neon → Reset password → mettre à jour Render),
  - `JWT_SECRET` (Render + `backend/.env`),
  - mot de passe admin et tokens éventuels.
- Le site public ne pointe aucun lien vers `/admin` (accès par URL uniquement).
- Rate limiting : 10 tentatives / 15 min sur `/login`, 300 req / 15 min sur l'API.

## 7. DÉPLOIEMENT FUTUR (rappel)

1. `git add -A && git commit -m "…" && git push` → Vercel (auto) + Render (auto).
2. Vérifier `https://campaignaema.onrender.com/health` et le bundle Vercel (section 5).
3. Tester le formulaire depuis le site **en ligne** puis l'**admin** `/admin`.