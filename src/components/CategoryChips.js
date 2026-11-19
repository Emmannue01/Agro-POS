import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme';

export default function CategoryChips({ items, active, onPress }) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isOn = item === active;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, isOn && styles.chipOn]}
            onPress={() => onPress(item)}
          >
            <Text style={[styles.chipText, isOn && styles.chipTextOn]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 2,
  },
  chipOn: {
    backgroundColor: COLORS.pri,
    borderColor: COLORS.pri,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.mut,
  },
  chipTextOn: {
    color: COLORS.on,
    fontWeight: '600',
  },
});
