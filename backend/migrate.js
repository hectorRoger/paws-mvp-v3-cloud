import fs from "fs";
import path from "path";
import pkg from "pg";
const { Pool } = pkg;

const DATA_PATH = path.join(process.cwd(), "data.json");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
});
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

async function main() {
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
  for (const it of data.items || []) {
    await pool.query(
      `insert into items (id,type,name,category,subcategory,price,stock,image,description)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [it.id, it.type, it.name, it.category, it.subcategory || null, it.price ?? null, it.stock ?? null, it.image || null, it.description || null]
    );
  }
  console.log("Migration complete");
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
