export const COLORS = {
  bg: '#f1f3ee',
  card: '#ffffff',
  tx: '#14231a',
  mut: '#4a5a50',
  ln: '#dde3d8',
  pri: '#1f5a3a',
  on: '#ffffff',
  hl: '#e8c547',
  hlx: '#14231a',
  bad: '#b3361f',
};

// Bandas de tipo de producto (tal como en el diseño HTML)
export const TYPE_COLOR = {
  verde: '#2e9e4f',
  azul: '#2f6fd6',
  amarillo: '#e6b800',
  rojo: '#d33',
};

// Iconos por categoría
export const CATEGORY_ICON = {
  Herbicida: '🌿',
  Insecticida: '🐛',
  Fungicida: '🍄',
  Fertilizante: '🧪',
  Equipo: '🎒',
};

export const CATEGORIES = ['Todos', 'Herbicida', 'Insecticida', 'Fungicida', 'Fertilizante', 'Equipo'];

export const PAY_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia'];

export function fmt(n) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
