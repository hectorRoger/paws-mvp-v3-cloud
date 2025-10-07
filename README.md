# Paws & Claws Kigali — MVP v3 (Cloud-ready)

New, separate project with:
- Search + price range filters
- Stable demo images (placedog/placekitten/picsum)
- Backend uses local JSON in dev, Postgres in cloud
- `render.yaml` for Render deploy; frontend env-ready for Vercel

## Local dev

### Backend
```bash
cd backend
npm install
npm run dev
# http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# usually http://localhost:5173
```

## Cloud quickstart

1) **DB**: create Postgres (Render, Supabase, or Neon) → copy DATABASE_URL  
2) **API (Render)**: use render.yaml blueprint, set env: DATABASE_URL, PGSSL=true, PORT=4000  
3) **Seed (optional)**: `cd backend && npm run migrate`  
4) **Frontend (Vercel)**: set `Root Directory = frontend`, env `VITE_API_URL=https://<your-render>.onrender.com/api`

## Admin login
- `admin / admin123`
