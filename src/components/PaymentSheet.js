import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, PAY_METHODS, fmt } from '../theme';

export default function PaymentSheet({
  visible,
  total,
  onClose,
  onConfirm,
  onPrint,
  onNewSale,
}) {
  const [method, setMethod] = useState('Efectivo');
  const [cash, setCash] = useState('');
  const [change, setChange] = useState('$0.00');
  const keyboardOffset = useRef(0);

  useEffect(() => {
    setMethod('Efectivo');
    setCash('');
    setChange('$0.00');
  }, [visible]);

  useEffect(() => {
    if (method === 'Efectivo') {
      const received = parseFloat(cash) || 0;
      setChange(fmt(Math.max(0, received - total)));
    }
  }, [cash, method, total]);

  const slide = new Animated.Value(visible ? 0 : 100);
  const backdrop = new Animated.Value(visible ? 1 : 0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: visible ? 0 : 100, duration: 250, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, slide, backdrop]);

  if (!visible && slide._value === 100) return null;

  const showCash = method === 'Efectivo';

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.backdrop}
        opacity={backdrop}
        onPress={onClose}
        activeOpacity={0.8}
      />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={KeyboardAvoidingViewBehavior()}
        >
          <View style={styles.pane}>
            <Text style={styles.title}>Cobrar</Text>
            <Text style={styles.big}>{fmt(total)}</Text>

            <View style={styles.chips}>
              {PAY_METHODS.map((m) => {
                const isOn = method === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, isOn && styles.chipOn]}
                    onPress={() => setMethod(m)}
                  >
                    <Text style={[styles.chipText, isOn && styles.chipTextOn]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showCash && (
              <View style={styles.cashBox}>
                <TextInput
                  style={styles.input}
                  value={cash}
                  onChangeText={setCash}
                  keyboardType="numeric"
                  placeholder="Efectivo recibido"
                  placeholderTextColor={COLORS.mut}
                />
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>Cambio</Text>
                  <Text style={[styles.changeValue, { fontSize: 22 }]}>{change}</Text>
                </View>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={onConfirm}>
                <Text style={styles.btnText}>Confirmar venta</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bottomSpacer}
            onPress={onClose}
            hitSlop={{ top: 40, bottom: 40, left: 20, right: 20 }}
          />
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

function KeyboardAvoidingViewBehavior() {
  // Evita doble padding en Android; se maneja con bottomSpacer
  return {};
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    maxHeight: '92%',
  },
  pane: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    paddingHorizontal: 16,
    minHeight: 260,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.tx,
    marginBottom: 4,
  },
  big: {
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.tx,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
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
  cashBox: {
    marginVertical: 12,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.tx,
    fontSize: 15,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  changeLabel: {
    fontSize: 14,
    color: COLORS.mut,
  },
  changeValue: {
    fontWeight: '700',
    color: COLORS.tx,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnGhost: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.ln,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.tx,
  },
  btn: {
    flex: 2,
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: COLORS.pri,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
  bottomSpacer: {
    flex: 1,
  },
});
