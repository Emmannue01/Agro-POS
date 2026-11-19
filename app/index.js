import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['componentWillMount has been renamed']);
import { MaterialCommunityIcons } from 'expo-vector-icons';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPE_COLOR, fmt } from '../src/theme';
import {
  seedProductsIfEmpty,
  getAllProducts,
  getProductByCode,
  updateProductStock,
  saveProduct,
  deleteProduct,
  saveSale,
  getAllSales,
  getNextFolio,
  saveCart,
  loadCart,
  clearCartDb,
  saveConfig,
  loadConfig,
} from '../src/database/productService';
import BrandHeader from '../src/components/BrandHeader';
import CategoryChips from '../src/components/CategoryChips';
import CartItem from '../src/components/CartItem';
import PaymentSheet from '../src/components/PaymentSheet';
import EditProductModal from '../src/components/EditProductModal';
import CameraScanner from '../src/components/CameraScanner';
import Toast from '../src/components/Toast';

const IC = { Herbicida: '🌿', Insecticida: '🐛', Fungicida: '🍄', Fertilizante: '🧪', Equipo: '🎒' };

export default function Home() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('hist');
  const [cart, setCart] = useState({});
  const [disc, setDisc] = useState(0);
  const [pm, setPm] = useState('Efectivo');
  const [folio, setFolio] = useState(1001);
  const [sales, setSales] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');
  const [hf, setHf] = useState('Todas');
  const [manualCode, setManualCode] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [discValue, setDiscValue] = useState('0');
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editProductVisible, setEditProductVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  // ---- Carga inicial desde Firebase ----
  useEffect(() => {
    const init = async () => {
      await seedProductsIfEmpty();
      const allProducts = await getAllProducts();
      setProducts(allProducts);

      const savedCart = await loadCart();
      setCart(savedCart);

      const allSales = await getAllSales();
      setSales(allSales);

      const nextF = await getNextFolio();
      setFolio(nextF);

      const savedDisc = await loadConfig('discount', '0');
      setDisc(parseFloat(savedDisc) || 0);
      setDiscValue(savedDisc || '0');

      setLoaded(true);
    };
    init();
  }, []);

  // ---- Guardar carrito cuando cambie ----
  useEffect(() => {
    if (loaded) {
      saveCart(cart);
    }
  }, [cart, loaded]);

  // ---- Guardar descuento cuando cambie ----
  useEffect(() => {
    if (loaded) {
      saveConfig('discount', String(disc));
    }
  }, [disc, loaded]);

  // ---- Cálculos derivados ----
  const safeCart = cart || {};
  const ids = Object.keys(safeCart);
  const subtotal = ids.reduce((s, id) => {
    const p = products.find((pr) => pr.id == id);
    return s + (p ? p.price * safeCart[id] : 0);
  }, 0);
  const ahorro = subtotal * (disc / 100);
  const total = subtotal - ahorro;
  const totalQty = ids.reduce((s, i) => s + (safeCart[i] || 0), 0);

  // ---- Productos filtrados para inventario ----
  const filteredProducts = products.filter((p) =>
    (cat === 'Todos' || p.category === cat) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.code.includes(q))
  );

  // ---- Carrito ----
  const add = (id, n = 1) => {
    const p = products.find((pr) => pr.id == id);
    if (!p) return false;
    const cur = safeCart[id] || 0;
    const nx = cur + n;
    if (nx > p.stock) {
      showToast('Stock insuficiente: quedan ' + p.stock + ' de ' + p.name);
      return false;
    }
    const next = { ...safeCart };
    if (nx <= 0) delete next[id];
    else next[id] = nx;
    setCart(next);
    showToast('Agregado a la venta');
    return true;
  };

  const clearCart = async () => {
    setCart({});
    await clearCartDb();
  };

  // ---- Historial ----
  const filteredSales = sales.filter((s) => hf === 'Todas' || s.pm === hf);
  const hoyTotal = sales.reduce((a, s) => a + s.tot, 0);

  // ---- Buscar producto por código ----
  const found = async (code) => {
    const c = String(code).trim();
    const p = await getProductByCode(c);
    if (!p) {
      showToast('Código no registrado: ' + c);
      return;
    }
    if (!(await add(p.id))) return;
    showToast(p.name + ' agregado');
    setManualCode('');
  };

  // ---- Activar cámara al entrar en Cobrar ----
  useEffect(() => {
    if (tab === 'cart') {
      setCameraActive(true);
    } else {
      setCameraActive(false);
    }
  }, [tab]);

  const toggleCam = () => {
    if (tab === 'cart') {
      setCameraActive(!cameraActive);
    } else {
      Alert.alert(
        'Cámara no disponible',
        'La cámara real requiere una compilación de desarrollo.\n\nUsa "Simular escaneo" o escribe el código manualmente.',
        [{ text: 'Entendido', style: 'cancel' }]
      );
    }
  };

  // ---- Confirmar venta ----
  const confirmSale = async () => {
    if (ids.length === 0) return;
    const L = [];
    for (const id of ids) {
      const p = products.find((pr) => pr.id == id);
      if (!p) continue;
      await updateProductStock(p.id, p.stock - safeCart[id]);
      L.push({ n: p.name, q: safeCart[id], p: p.price });
    }
    const s = {
      f: folio,
      at: new Date().toISOString(),
      pm,
      disc,
      rec: pm === 'Efectivo' ? 0 : 0,
      sub: subtotal,
      tot: total,
      L,
    };
    await saveSale(s);
    const allSales = await getAllSales();
    setSales(allSales);
    setCart({});
    await clearCartDb();
    setDisc(0);
    setDiscValue('0');
    setFolio(folio + 1);
    await saveConfig('folio', String(folio + 1));
    setSheetVisible(false);
    showToast('Venta registrada');
  };

  // ---- Editar producto ----
  const handleSaveProduct = async (updated) => {
    await saveProduct(updated);
    const all = await getAllProducts();
    setProducts(all);
    setEditProductVisible(false);
    setEditingProduct(null);
    showToast('Producto guardado');
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    const all = await getAllProducts();
    setProducts(all);
    setEditProductVisible(false);
    setEditingProduct(null);
    showToast('Producto eliminado');
  };

  if (!loaded) return null;

  function getIconName(category) {
    const map = {
      Herbicida: 'leaf',
      Insecticida: 'bug',
      Fungicida: 'mushroom-outline',
      Fertilizante: 'chemistry',
      Equipo: 'backpack',
    };
    return map[category] || 'package';
  }

  // ==================== SECCIÓN: HISTORIAL ====================
  const renderHistorial = () => (
    <View>
      <View style={styles.hsum}>
        <View>
          <Text style={styles.hsumSmall}>Vendido hoy</Text>
          <Text style={styles.hsumPrice}>{fmt(hoyTotal)}</Text>
        </View>
        <View style={styles.hsumRight}>
          <Text style={styles.hsumSmall}>Ventas</Text>
          <Text style={styles.hsumPrice}>{sales.length}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => setTab('cart')}>
          <Text style={styles.btnText}>Nueva venta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Filtrar por pago</Text>
      <CategoryChips
        items={['Todas', 'Efectivo', 'Tarjeta', 'Transferencia']}
        active={hf}
        onPress={(v) => setHf(v)}
      />

      <View style={styles.list}>
        {filteredSales.length > 0 ? (
          filteredSales.map((s) => (
            <TouchableOpacity
              key={s.f}
              style={styles.hs}
              onPress={() =>
                showToast('Folio ' + s.f + ' · ' + fmt(s.tot) + ' · ' + s.pm)
              }
            >
              <View style={styles.hsLeft}>
                <Text style={styles.hsName}>Folio {s.f}</Text>
                <Text style={styles.hsMeta}>
                  {new Date(s.at).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} ·
                  {s.L.reduce((a, x) => a + x.q, 0)} artículos ·
                  {s.pm}
                </Text>
              </View>
              <Text style={styles.hsPrice}>{fmt(s.tot)}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay ventas con este filtro.</Text>
          </View>
        )}
      </View>
    </View>
  );

  // ==================== SECCIÓN: COBRAR / CARRITO ====================
  const renderCobrar = () => (
    <View>
      {cameraActive && (
        <CameraScanner
          visible={true}
          onClose={() => setCameraActive(false)}
          onCodeScanned={(code) => {
            setCameraActive(false);
            found(code);
          }}
        />
      )}
      {!cameraActive && (
        <View style={styles.manual}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="Escribe el código de barras"
            placeholderTextColor={COLORS.mut}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.btnAddManual} onPress={() => found(manualCode)}>
            <Text style={styles.btnText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>VENTA ACTUAL</Text>
      <View style={styles.list}>
        {ids.length > 0 ? (
          ids.map((id) => (
            <CartItem
              key={id}
              product={products.find((pr) => pr.id == id)}
              qty={safeCart[id]}
              onAdd={() => add(id, 1)}
              onRemove={() => add(id, -1)}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              <Text style={{ fontWeight: '600' }}>Sin productos en la venta</Text>{' '}
              Escanea un código o agrégalo desde el inventario.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sum}>
        <View style={styles.sumRow}>
          <Text>Subtotal</Text>
          <Text style={styles.sumNum}>{fmt(subtotal)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Descuento (%)</Text>
          <TextInput
            style={styles.sumInput}
            value={discValue}
            onChangeText={(t) => {
              setDiscValue(t);
              setDisc(Math.min(100, Math.max(0, parseFloat(t) || 0)));
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.discChipsFull}>
          {['5', '10', '15'].map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.discChip,
                disc == parseInt(d) && styles.discChipActive,
              ]}
              onPress={() => {
                const val = parseInt(d);
                if (disc === val) {
                  setDisc(0);
                  setDiscValue('0');
                } else {
                  setDisc(val);
                  setDiscValue(d);
                }
              }}
            >
              <Text style={styles.discChipText}>{d}%</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sumRow}>
          <Text>Ahorro</Text>
          <Text style={styles.sumNum}>{fmt(ahorro)}</Text>
        </View>
        <View style={styles.sumTot}>
          <Text style={styles.sumTotLabel}>Total</Text>
          <Text style={styles.sumTotPrice}>{fmt(total)}</Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={clearCart}>
          <Text style={styles.btnText}>Vaciar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { flex: 2 }]}
          onPress={() => setSheetVisible(true)}
          disabled={ids.length === 0}
        >
          <Text style={[styles.btnText, { color: ids.length ? COLORS.on : 'rgba(255,255,255,0.4)' }]}>
            Cobrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==================== SECCIÓN: INVENTARIO ====================
  const renderInventario = () => (
    <View>
      <View style={styles.invSearchRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={q}
          onChangeText={setQ}
          placeholder="Buscar producto o código"
          placeholderTextColor={COLORS.mut}
        />
        <TouchableOpacity style={styles.btnAddNew} onPress={() => {
          setEditingProduct(null);
          setEditProductVisible(true);
        }}>
          <MaterialCommunityIcons name="plus" size={18} color={COLORS.on} />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Categorías</Text>
      <CategoryChips
        items={['Todos', 'Herbicida', 'Insecticida', 'Fungicida', 'Fertilizante', 'Equipo']}
        active={cat}
        onPress={(v) => setCat(v)}
      />

      <View style={styles.list}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <View style={styles.invProductRow} key={p.id}>
              <View style={styles.invInfo}>
                <View style={styles.invNameRow}>
                  <MaterialCommunityIcons
                    name={getIconName(p.category)}
                    size={16}
                    style={styles.invIcon}
                    color={COLORS.mut}
                  />
                  <Text style={styles.invName}>{p.name}</Text>
                </View>
                <Text style={styles.invMeta}>
                  {p.unit} · {p.code}
                </Text>
                <Text style={[styles.invStock, p.stock <= 8 && styles.invStockLow]}>
                  {p.stock <= 8 ? 'Stock bajo: ' : 'Stock: '}{p.stock}
                </Text>
              </View>

              <View style={styles.invPrice}>
                <Text style={styles.invPriceText}>{fmt(p.price)}</Text>
              </View>

              <View style={styles.invActions}>
                <TouchableOpacity
                  style={styles.invAddBtn}
                  onPress={() => add(p.id, 1)}
                  disabled={(safeCart[p.id] || 0) >= p.stock}
                >
                  <Text style={styles.invAddText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invEditBtn}
                  onPress={() => {
                    setEditingProduct(p);
                    setEditProductVisible(true);
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color={COLORS.pri} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invDeleteBtn}
                  onPress={() => {
                    setEditingProduct(p);
                    setEditProductVisible(true);
                  }}
                >
                  <MaterialCommunityIcons name="delete" size={18} color={COLORS.bad} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.btnScan} onPress={toggleCam}>
        <MaterialCommunityIcons name="barcode-scan" size={20} color={COLORS.on} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader total={fmt(total)} onTotalPress={() => setTab('cart')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
          paddingBottom: (insets.bottom || 0) + 110,
        }}
      >
        {tab === 'hist' ? renderHistorial() : null}
        {tab === 'cart' ? renderCobrar() : null}
        {tab === 'inv' ? renderInventario() : null}
      </ScrollView>

      {/* ---------- NAV (fijo al fondo) ---------- */}
      <View style={[styles.nav, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
        <TouchableOpacity
          style={[styles.navItem, tab === 'hist' && styles.navItemOn]}
          onPress={() => setTab('hist')}
        >
          <MaterialCommunityIcons name="receipt" size={24} style={styles.navIcon} />
          <Text style={[styles.navLabel, tab === 'hist' && styles.navLabelOn]}>Ventas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, tab === 'cart' && styles.navItemOn]}
          onPress={() => setTab('cart')}
        >
          <MaterialCommunityIcons name="cart" size={24} style={styles.navIcon} />
          <Text style={[styles.navLabel, tab === 'cart' && styles.navLabelOn]}>Cobrar</Text>
          {totalQty > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalQty}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, tab === 'inv' && styles.navItemOn]}
          onPress={() => setTab('inv')}
        >
          <MaterialCommunityIcons name="package" size={24} style={styles.navIcon} />
          <Text style={[styles.navLabel, tab === 'inv' && styles.navLabelOn]}>Inventario</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- SHEET (cobrar) ---------- */}
      {sheetVisible && (
        <PaymentSheet
          visible={true}
          total={total}
          onClose={() => setSheetVisible(false)}
          onConfirm={confirmSale}
          onPrint={() => showToast('Conecta una impresora térmica para imprimir')}
          onNewSale={() => {
            setSheetVisible(false);
            setTab('cart');
          }}
        />
      )}

      <Toast
        visible={toastVisible}
        message={toastMsg}
        onHide={() => setToastVisible(false)}
      />

      {/* ---------- MODAL EDITAR / NUEVO PRODUCTO ---------- */}
      <EditProductModal
        visible={editProductVisible}
        product={editingProduct}
        onClose={() => setEditProductVisible(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  hsum: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.pri,
    marginBottom: 12,
  },
  hsumSmall: {
    fontSize: 12,
    color: COLORS.mut,
  },
  hsumPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.tx,
    letterSpacing: 0.5,
  },
  hsumRight: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  btn: {
    flex: 1,
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.ln,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
  btnAddManual: {
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.mut,
    letterSpacing: 0.5,
    marginVertical: 10,
  },
  list: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  empty: {
    padding: 34,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.mut,
    textAlign: 'center',
    fontSize: 14,
  },
  cam: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0b140e',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  camFrame: {
    position: 'absolute',
    top: '18%',
    left: '12%',
    right: '12%',
    bottom: '12%',
    borderWidth: 2,
    borderColor: COLORS.hl,
    borderRadius: 8,
  },
  camHint: {
    position: 'absolute',
    bottom: 8,
    fontSize: 13,
    color: '#cfe0d2',
  },
  manual: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.tx,
    fontSize: 15,
  },
  // ---------- INVENTARIO ----------
  invSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  btnAddNew: {
    backgroundColor: COLORS.pri,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ln,
  },
  invInfo: {
    flex: 1,
    paddingRight: 8,
  },
  invNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  invIcon: {
    fontSize: 16,
  },
  invName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.tx,
  },
  invMeta: {
    fontSize: 12,
    color: COLORS.mut,
    marginBottom: 2,
  },
  invStock: {
    fontSize: 12,
    color: COLORS.mut,
  },
  invStockLow: {
    color: COLORS.bad,
    fontWeight: '700',
  },
  invPrice: {
    marginRight: 8,
  },
  invPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.tx,
  },
  invActions: {
    flexDirection: 'row',
    gap: 6,
  },
  invAddBtn: {
    backgroundColor: COLORS.pri,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  invAddText: {
    color: COLORS.on,
    fontWeight: '700',
    fontSize: 16,
  },
  invEditBtn: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 6,
    padding: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  invDeleteBtn: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 6,
    padding: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  btnAddProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '85%',
    marginTop: 16,
  },
  btnAddProductText: {
    color: COLORS.on,
    fontWeight: '700',
    fontSize: 14,
  },
  // ---------- DESCUENTO ----------
  discChipsFull: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  discChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discChipActive: {
    backgroundColor: COLORS.pri,
    borderColor: COLORS.pri,
  },
  discChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tx,
  },
  // ---------- RESUMEN ----------
  sum: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  sumLabel: {
    fontSize: 14,
    color: COLORS.mut,
  },
  sumNum: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.tx,
  },
  sumInput: {
    width: 70,
    textAlign: 'right',
    color: COLORS.tx,
    fontSize: 15,
    fontWeight: '600',
  },
  sumTot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.ln,
    marginTop: 6,
    paddingTop: 8,
  },
  sumTotLabel: {
    fontWeight: '700',
    fontSize: 15,
    color: COLORS.tx,
  },
  sumTotPrice: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.tx,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: COLORS.bg,
    paddingTop: 10,
  },
  hs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ln,
  },
  hsLeft: {},
  hsName: {
    fontWeight: '700',
    color: COLORS.tx,
    fontSize: 15,
  },
  hsMeta: {
    fontSize: 12,
    color: COLORS.mut,
    marginTop: 1,
  },
  hsPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.tx,
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ln,
    height: 75,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navItemOn: {},
  navIcon: {
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mut,
  },
  navLabelOn: {
    color: COLORS.pri,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: '55%',
    backgroundColor: COLORS.hl,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.hlx,
  },
});
