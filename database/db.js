import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'carimakan.json');

// Struktur data awal
const defaultData = {
  users: [],
  favorites: [],
  orders: [],
  payments: [],
  _meta: {
    lastUserId: 0,
    lastOrderId: 0,
    lastPaymentId: 0,
    lastFavoriteId: 0,
  },
};

const adapter = new JSONFileSync(DB_PATH);
const db = new LowSync(adapter, defaultData);

// Baca data dari file
db.read();

// Pastikan struktur default ada
db.data = { ...defaultData, ...db.data };
db.write();

// ─── Helper: Auto-increment ID ─────────────────────────────────────────────
export function nextId(meta, key) {
  db.data._meta[key] = (db.data._meta[key] || 0) + 1;
  db.write();
  return db.data._meta[key];
}

console.log(`✅ Database JSON ready at: ${DB_PATH}`);

export default db;
