import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

export default function BrandHeader({ total, onTotalPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>MARSAL S.A. de C.V.</Text>
          <Text style={styles.brandSub}>Marcos Aurelio Salado Chavez</Text>
        </View>
        <View
          style={[styles.chip, { backgroundColor: COLORS.hl, borderColor: COLORS.hl }]}
          onPress={onTotalPress}
        >
          <Text style={styles.chipText}>{total}</Text>
        </View>
      </View>
      <View style={styles.bands}>
        <View style={[styles.band, { backgroundColor: '#2e9e4f' }]} />
        <View style={[styles.band, { backgroundColor: '#2f6fd6' }]} />
        <View style={[styles.band, { backgroundColor: '#e6b800' }]} />
        <View style={[styles.band, { backgroundColor: '#d33' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.pri,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {},
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.on,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
  chip: {
    backgroundColor: COLORS.hl,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.hlx,
    letterSpacing: 0.5,
  },
  bands: {
    height: 6,
    marginHorizontal: -16,
    flexDirection: 'row',
  },
  band: {
    flex: 1,
  },
});
