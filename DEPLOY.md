# Deploy guide (Render + Vercel)

## 1) Push to GitHub
Push this entire folder to a new repo.

## 2) Render (API + Postgres)
- Render → New → *Blueprint* → pick your GitHub repo
- It provisions **paws-db** (Postgres Free) and **paws-api** (Node web service)
- After deploy, open: https://<paws-api>.onrender.com/api/health

> Seeding note: `preDeployCommand: node migrate.js` seeds DB from `backend/data.json`.

## 3) Vercel (Frontend)
- Vercel → New Project → import the same repo
- **Root Directory**: `frontend`
- Env Var: `VITE_API_URL = https://<paws-api>.onrender.com/api`
- Deploy

## 4) Test
- Open your Vercel URL, browse Shop, Services, Admin.
- Admin login: `admin / admin123`
