import { TYPE_COLOR, CATEGORY_ICON } from '../theme';


export function findProduct(id) {
  return PRODUCTS.find((p) => p.id == id);
}

export function findProductByCode(code) {
  return PRODUCTS.find((p) => p.code === String(code).trim());
}

export function productTypeColor(p) {
  return TYPE_COLOR[p.t] || '#dde3d8';
}

export function productIcon(p) {
  return CATEGORY_ICON[p.c] || '📦';
}
