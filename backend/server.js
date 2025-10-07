import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Mode: DB in cloud, JSON locally
const isDbMode = !!process.env.DATABASE_URL;
const DATA_PATH = path.join(process.cwd(), "data.json");
let pool = null;

if (isDbMode) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  console.log("[API] Using Postgres");
} else {
  console.log("[API] Using local JSON file:", DATA_PATH);
}

// --- Local JSON helpers
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { items: [], users: [{ username: "admin", password: "admin123" }] };
  }
}
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
let db = isDbMode ? null : loadData();

// --- Schema + one-time seed on boot (for free tier)
async function ensureSchema() {
  if (!isDbMode) return;
  await pool.query(`
    create table if not exists items (
      id text primary key,
      type text not null check (type in ('product','service','bundle')),
      name text not null,
      category text not null,
      subcategory text,
      price integer,
      stock integer,
      image text,
      description text
    );
  `);
}

async function seedIfEmpty() {
  // Only in DB mode, only when SEED_ON_BOOT=true
  if (!isDbMode || process.env.SEED_ON_BOOT !== "true") return;

  const { rows } = await pool.query(`select count(*)::int as c from items`);
  if (rows[0].c > 0) {
    console.log("[seed] Table already has data, skipping.");
    return;
  }

  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    const items = Array.isArray(data.items) ? data.items : [];
    let inserted = 0;
    for (const it of items) {
      await pool.query(
        `insert into items (id,type,name,category,subcategory,price,stock,image,description)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (id) do nothing`,
        [
          it.id,
          it.type,
          it.name,
          it.category,
          it.subcategory || null,
          it.price ?? null,
          it.stock ?? null,
          it.image || null,
          it.description || null,
        ]
      );
      inserted++;
    }
    console.log(`[seed] Inserted ${inserted} items from data.json`);
  } catch (e) {
    console.warn("[seed] skipped:", e.message);
  }
}

ensureSchema().then(seedIfEmpty).catch(console.error);

// --- Auth (demo only)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  const ok =
    (!isDbMode && db.users.find((u) => u.username === username && u.password === password)) ||
    (isDbMode && username === "admin" && password === "admin123");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = "demo-token-" + uuidv4();
  res.json({ token });
});

// --- List items (filters: type, category, q, min, max)
app.get("/api/items", async (req, res) => {
  const { category, type, q, min, max } = req.query;

  if (isDbMode) {
    const clauses = [];
    const vals = [];
    if (type) {
      vals.push(type);
      clauses.push(`type = $${vals.length}`);
    }
    if (category) {
      vals.push(category);
      clauses.push(`category = $${vals.length}`);
    }
    if (q) {
      vals.push(`%${q.toLowerCase()}%`);
      clauses.push(
        `(lower(name) like $${vals.length} or lower(description) like $${vals.length})`
      );
    }
    if (min) {
      vals.push(Number(min));
      clauses.push(`(price is null or price >= $${vals.length})`);
    }
    if (max) {
      vals.push(Number(max));
      clauses.push(`(price is null or price <= $${vals.length})`);
    }
    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const { rows } = await pool.query(
      `select * from items ${where} order by name asc`,
      vals
    );
    return res.json(rows);
  } else {
    let items = db.items;
    if (type) items = items.filter((i) => i.type === type);
    if (category) items = items.filter((i) => i.category === category);
    if (q) {
      const needle = String(q).toLowerCase();
      items = items.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(needle) ||
          (i.description || "").toLowerCase().includes(needle)
      );
    }
    if (min) items = items.filter((i) => i.price == null || i.price >= Number(min));
    if (max) items = items.filter((i) => i.price == null || i.price <= Number(max));
    return res.json(items);
  }
});

// --- Create
app.post("/api/items", async (req, res) => {
  const item = req.body;
  if (!item || !item.name) return res.status(400).json({ error: "Missing item.name" });
  item.id = item.id || uuidv4();

  if (isDbMode) {
    const q = `
      insert into items (id,type,name,category,subcategory,price,stock,image,description)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning *`;
    const vals = [
      item.id,
      item.type,
      item.name,
      item.category,
      item.subcategory || null,
      item.price ?? null,
      item.stock ?? null,
      item.image || null,
      item.description || null,
    ];
    const { rows } = await pool.query(q, vals);
    return res.json(rows[0]);
  } else {
    db.items.push(item);
    saveData(db);
    return res.json(item);
  }
});

// --- Update
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const patch = { ...req.body, id };

  if (isDbMode) {
    const existing = await pool.query(`select * from items where id=$1`, [id]);
    if (!existing.rows.length) return res.status(404).json({ error: "Not found" });
    const cur = existing.rows[0];
    const next = { ...cur, ...patch };
    const q = `
      update items set type=$2, name=$3, category=$4, subcategory=$5,
        price=$6, stock=$7, image=$8, description=$9
      where id=$1 returning *`;
    const vals = [
      next.id,
      next.type,
      next.name,
      next.category,
      next.subcategory || null,
      next.price ?? null,
      next.stock ?? null,
      next.image || null,
      next.description || null,
    ];
    const { rows } = await pool.query(q, vals);
    return res.json(rows[0]);
  } else {
    const idx = db.items.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    db.items[idx] = { ...db.items[idx], ...patch };
    saveData(db);
    return res.json(db.items[idx]);
  }
});

// --- Delete
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  if (isDbMode) {
    const del = await pool.query(`delete from items where id=$1`, [id]);
    if (del.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  } else {
    const before = db.items.length;
    db.items = db.items.filter((i) => i.id !== id);
    if (db.items.length === before) return res.status(404).json({ error: "Not found" });
    saveData(db);
    return res.json({ ok: true });
  }
});

// --- Categories (products only)
app.get("/api/categories", async (_req, res) => {
  if (isDbMode) {
    const { rows } = await pool.query(
      `select distinct category from items where type='product' order by category asc`
    );
    return res.json(rows.map((r) => r.category));
  } else {
    const cats = Array.from(
      new Set(db.items.filter((i) => i.type === "product").map((i) => i.category))
    ).sort();
    return res.json(cats);
  }
});

// --- Health
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, mode: isDbMode ? "db" : "json" })
);

// --- Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
