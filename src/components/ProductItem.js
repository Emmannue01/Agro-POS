import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from 'expo-vector-icons';
import { COLORS, TYPE_COLOR, fmt } from '../theme';

const CATEGORY_ICON_NAME = {
  Herbicida: 'leaf',
  Insecticida: 'bug',
  Fungicida: 'mushroom-outline',
  Fertilizante: 'chemistry',
  Equipo: 'backpack',
};

export default function ProductItem({ product, inCartQty, disabled, onAdd }) {
  const low = product.st <= 8;
  const barColor = TYPE_COLOR[product.t];
  const iconName = CATEGORY_ICON_NAME[product.c] || 'package';

  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: barColor }]} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <MaterialCommunityIcons name={iconName} size={16} style={styles.nameIcon} />
          <Text style={styles.name}>{product.n}</Text>
        </View>
        <Text style={styles.meta}>{product.u} · {product.code}</Text>
        <Text style={[styles.stock, low && styles.stockLow]}>
          {low ? 'Stock bajo: ' : 'Stock: '}{product.st}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, { fontSize: 20 }]}>{fmt(product.price)}</Text>
        <TouchableOpacity
          style={[styles.addBtn, disabled && styles.addBtnDisabled]}
          onPress={onAdd}
          disabled={disabled}
        >
          <Text style={[styles.addText, disabled && styles.addTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ln,
  },
  bar: {
    width: 6,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.tx,
  },
  meta: {
    fontSize: 12,
    color: COLORS.mut,
    marginTop: 1,
  },
  stock: {
    fontSize: 12,
    color: COLORS.mut,
    marginTop: 1,
  },
  stockLow: {
    color: COLORS.bad,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: '700',
    color: COLORS.tx,
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.pri,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    opacity: 0.3,
  },
  addText: {
    fontSize: 22,
    lineHeight: 1,
    color: COLORS.on,
  },
  addTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
});
