import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from 'expo-vector-icons';
import { COLORS } from '../theme';
import CameraScanner from './CameraScanner';

export default function EditProductModal({
  visible,
  product,
  onClose,
  onSave,
  onDelete,
  onScan,
}) {
  const isMounted = useRef(false);

  const initialProduct = product || {
    id: Date.now(),
    name: '',
    code: '',
    category: 'Herbicida',
    unit: '',
    price: 0,
    stock: 0,
  };

  const [name, setName] = useState(initialProduct.name || '');
  const [code, setCode] = useState(initialProduct.code || '');
  const [category, setCategory] = useState(initialProduct.category || 'Herbicida');
  const [unit, setUnit] = useState(initialProduct.unit || '');
  const [price, setPrice] = useState(String(initialProduct.price || 0));
  const [stock, setStock] = useState(String(initialProduct.stock || 0));
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sincronizar estado local cuando cambie el prop product
  useEffect(() => {
    if (product && isMounted.current) {
      setName(product.name || '');
      setCode(product.code || '');
      setCategory(product.category || 'Herbicida');
      setUnit(product.unit || '');
      setPrice(String(initialProduct.price || 0));
      setStock(String(initialProduct.stock || 0));
    }
  }, [product]);

  const CATEGORIES = [
    'Herbicida',
    'Insecticida',
    'Fungicida',
    'Fertilizante',
    'Equipo',
  ];

  const handleScanCode = (scannedCode) => {
    setCode(scannedCode);
    setCameraVisible(false);
  };

  const handleSave = () => {
    if (!isMounted.current) return;
    const p = parseFloat(price);
    const s = parseInt(stock, 10);
    if (isNaN(p) || p < 0) {
      Alert.alert('Precio inválido');
      return;
    }
    if (isNaN(s) || s < 0) {
      Alert.alert('Stock inválido');
      return;
    }
    onSave({
      ...(product || {}),
      name,
      code,
      category,
      unit,
      price: p,
      stock: s,
    });
  };

  const handleDelete = () => {
    if (!isMounted.current) return;
    if (!product) return;
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${product.name}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(product.id),
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.backdrop} onPress={onClose}>
      <View style={styles.modalWrapper} onPress={(e) => e.stopPropagation()}>
        {/* Cámara de escaneo */}
        {cameraVisible && (
          <CameraScanner
            visible={true}
            onClose={() => setCameraVisible(false)}
            onCodeScanned={handleScanCode}
          />
        )}
        {!cameraVisible && (
          <View style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>Editar producto</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={20} color={COLORS.mut} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Código de barras</Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.btnScanCode} onPress={() => setCameraVisible(true)}>
                  <MaterialCommunityIcons name="barcode-scan" size={18} color={COLORS.on} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryChip,
                      category === c && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={styles.categoryChipText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Unidad</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
              />

              <View style={styles.priceStockRow}>
                <View style={styles.priceStockCol}>
                  <Text style={styles.label}>Precio</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceStockCol}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnDelete} onPress={handleDelete}>
                <MaterialCommunityIcons name="delete" size={18} color={COLORS.bad} />
                <Text style={styles.btnText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <MaterialCommunityIcons name="check" size={18} color={COLORS.on} />
                <Text style={styles.btnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalWrapper: {
    width: '90%',
    maxWidth: 400,
  },
  panel: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.tx,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mut,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.tx,
    fontSize: 14,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnScanCode: {
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.pri,
    borderColor: COLORS.pri,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tx,
  },
  priceStockRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceStockCol: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bad,
    borderRadius: 8,
    paddingVertical: 10,
  },
  btnCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mut,
  },
  btnSave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 10,
  },
  btnSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
});
