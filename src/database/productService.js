import {
  ref,
  set,
  get,
  update,
  remove,
} from 'firebase/database';
import { database } from '../firebase/config';

// ========================================
// PRODUCTOS
// ========================================
const PRODUCTS_PATH = 'products';

export async function seedProductsIfEmpty() {
  // Los productos solo se gestionan en Firebase, no hay semilla local
}

export async function getAllProducts() {
  const snapshot = await get(ref(database, PRODUCTS_PATH));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function getProductByCode(code) {
  const all = await getAllProducts();
  return all.find((p) => p.code === code) || null;
}

export async function getProductById(id) {
  const all = await getAllProducts();
  return all.find((p) => p.id == id) || null;
}

export async function updateProductStock(id, newStock) {
  await update(ref(database, `${PRODUCTS_PATH}/${id}/stock`), newStock);
}

export async function saveProduct(product) {
  await set(ref(database, `${PRODUCTS_PATH}/${product.id}`), product);
}

export async function deleteProduct(id) {
  await remove(ref(database, `${PRODUCTS_PATH}/${id}`));
}

// ========================================
// VENTAS
// ========================================
const SALES_PATH = 'sales';

export async function saveSale(sale) {
  const key = String(sale.f);
  await set(ref(database, `${SALES_PATH}/${key}`), sale);
}

export async function getAllSales() {
  const snapshot = await get(ref(database, SALES_PATH));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => data[key])
    .sort((a, b) => b.f - a.f);
}

export async function getNextFolio() {
  const sales = await getAllSales();
  if (sales.length === 0) return 1001;
  return Math.max(...sales.map((s) => s.f)) + 1;
}

// ========================================
// CARRITO
// ========================================
const CART_PATH = 'cart';

export async function saveCart(cart) {
  await set(ref(database, CART_PATH), cart);
}

export async function loadCart() {
  const snapshot = await get(ref(database, CART_PATH));
  if (!snapshot.exists()) return {};
  return snapshot.val();
}

export async function clearCartDb() {
  await remove(ref(database, CART_PATH));
}

// ========================================
// CONFIGURACIÓN
// ========================================
const CONFIG_PATH = 'config';

export async function saveConfig(key, value) {
  await set(ref(database, `${CONFIG_PATH}/${key}`), String(value));
}

export async function loadConfig(key, defaultValue = null) {
  const snapshot = await get(ref(database, `${CONFIG_PATH}/${key}`));
  if (!snapshot.exists()) return defaultValue;
  return snapshot.val();
}
