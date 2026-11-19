import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../theme';

export default function Toast({ visible, message, onHide, duration = 2000 }) {
  const opacity = new Animated.Value(visible ? 1 : 0);
  const translateY = new Animated.Value(visible ? 0 : 8);

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        if (onHide) onHide();
      });
      Animated.timing(translateY, { toValue: 8, duration: 200, useNativeDriver: true }).start();
    }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onHide}>
      <View style={styles.container}>
        <Animated.View style={[styles.box, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 90,
    alignItems: 'center',
    zIndex: 9,
  },
  box: {
    backgroundColor: COLORS.tx,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.bg,
    fontSize: 14,
    textAlign: 'center',
  },
});
