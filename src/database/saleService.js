import { getDatabase } from './db';

export function saveCart(cart) {
  const db = getDatabase();
  db.runSync('DELETE FROM cart');
  const insert = db.prepareSync('INSERT INTO cart (product_id, quantity) VALUES (?, ?)');
  for (const [productId, quantity] of Object.entries(cart)) {
    insert.run(parseInt(productId, 10), quantity);
  }
}

export function loadCart() {
  const db = getDatabase();
  const rows = db.getAllSync('SELECT product_id, quantity FROM cart');
  const cart = {};
  for (const row of rows) {
    cart[row.product_id] = row.quantity;
  }
  return cart;
}

export function clearCart() {
  const db = getDatabase();
  db.runSync('DELETE FROM cart');
}

export function saveSale(sale) {
  const db = getDatabase();
  const { folio, date, paymentMethod, discount, subtotal, total, received, items } = sale;

  db.runSync(
    'INSERT INTO sales (folio, date, payment_method, discount, subtotal, total, received) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [folio, date.toISOString(), paymentMethod, discount, subtotal, total, received]
  );

  const insertItem = db.prepareSync(
    'INSERT INTO sale_items (folio, product_name, quantity, price) VALUES (?, ?, ?, ?)'
  );
  for (const item of items) {
    insertItem.run(folio, item.name, item.quantity, item.price);
  }
}

export function getAllSales() {
  const db = getDatabase();
  const sales = db.getAllSync('SELECT * FROM sales ORDER BY folio DESC');
  const result = [];
  for (const s of sales) {
    const items = db.getAllSync(
      'SELECT product_name as name, quantity, price FROM sale_items WHERE folio = ?',
      [s.folio]
    );
    result.push({
      f: s.folio,
      at: new Date(s.date),
      pm: s.payment_method,
      disc: s.discount,
      rec: s.received,
      sub: s.subtotal,
      tot: s.total,
      L: items.map((i) => ({ n: i.name, q: i.quantity, p: i.price })),
    });
  }
  return result;
}

export function getNextFolio() {
  const db = getDatabase();
  const row = db.getAllSync('SELECT MAX(folio) as maxFolio FROM sales')[0];
  return (row.maxFolio || 1000) + 1;
}

export function saveConfig(key, value) {
  const db = getDatabase();
  db.runSync('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, String(value)]);
}

export function loadConfig(key, defaultValue = null) {
  const db = getDatabase();
  const row = db.getAllSync('SELECT value FROM config WHERE key = ?', [key]);
  return row.length > 0 ? row[0].value : defaultValue;
}
