import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, TYPE_COLOR, fmt } from '../theme';

export default function CartItem({ product, qty, onAdd, onRemove }) {
  const barColor = TYPE_COLOR[product.type_color || product.t];
  const lineTotal = product.price * qty;

  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: barColor }]} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name || product.n}</Text>
        <Text style={styles.meta}>{product.unit || product.u} · {fmt(product.price)}</Text>
        <View style={styles.qt}>
          <TouchableOpacity
            style={styles.qtBtn}
            onPress={onRemove}
            activeOpacity={0.7}
          >
            <Text style={styles.qtText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtQty}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtBtn}
            onPress={onAdd}
            activeOpacity={0.7}
          >
            <Text style={styles.qtText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.lineTotal, { fontSize: 20 }]}>{fmt(lineTotal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    fontWeight: '700',
    color: COLORS.tx,
  },
  meta: {
    fontSize: 12,
    color: COLORS.mut,
    marginTop: 2,
  },
  qt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  qtBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtText: {
    fontSize: 20,
    color: COLORS.tx,
    lineHeight: 1,
  },
  qtQty: {
    minWidth: 26,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.tx,
    fontSize: 16,
  },
  lineTotal: {
    fontWeight: '700',
    color: COLORS.tx,
    letterSpacing: 0.5,
  },
});
