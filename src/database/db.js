import { openDatabaseSync } from 'expo-sqlite';

const DB_NAME = 'agro_pos.db';

let db = null;

export function getDatabase() {
  if (!db) {
    db = openDatabaseSync(DB_NAME);
    initTables();
  }
  return db;
}

function initTables() {
  const database = getDatabase();

  // Tabla de productos
  database.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      type_color TEXT
    );
  `);

  // Tabla de ventas
  database.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      folio INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      received REAL NOT NULL DEFAULT 0
    );
  `);

  // Tabla de items de venta
  database.execSync(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (folio) REFERENCES sales(folio)
    );
  `);

  // Tabla de carrito (sesión actual)
  database.execSync(`
    CREATE TABLE IF NOT EXISTS cart (
      product_id INTEGER PRIMARY KEY,
      quantity INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Tabla de configuración (folio siguiente, descuento, etc.)
  database.execSync(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export default {
  getDatabase,
};
