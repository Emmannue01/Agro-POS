import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Carga segura de expo-camera (no disponible en Expo Go estándar)
let Camera, CameraType, useCameraPermissions;
try {
  const expoCamera = require('expo-camera');
  Camera = expoCamera.Camera;
  CameraType = expoCamera.CameraType;
  useCameraPermissions = expoCamera.useCameraPermissions;
} catch (e) {
  Camera = null;
  CameraType = { back: 'back', front: 'front' };
  useCameraPermissions = () => [null, async () => ({ status: 'denied' })];
}

export default function CameraScanner({ onCodeScanned, visible, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState(CameraType.back);
  const [scanning, setScanning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    (async () => {
      if (permission !== 'granted') {
        const { status } = await requestPermission();
        if (status !== 'granted') {
          setCameraError('Permiso de cámara denegado');
        }
      }
    })();
  }, [permission, requestPermission]);

  useEffect(() => {
    setScanning(visible);
  }, [visible]);

  const handleBarCodeScanned = useCallback(
    ({ data }) => {
      if (!scanning || !data) return;
      setScanning(false);
      if (onCodeScanned) onCodeScanned(data);
    },
    [scanning, onCodeScanned]
  );

  if (!mounted || !visible) return null;

  if (!Camera) {
    return (
      <View style={styles.noCameraWrapper}>
        <View style={styles.noCameraCard}>
          <Text style={styles.noCameraTitle}>Cámara no disponible</Text>
          <Text style={styles.noCameraText}>
            La cámara requiere una compilación de desarrollo (expo-camera no está
            incluido en Expo Go).
          </Text>
          <TouchableOpacity style={styles.noCameraBtn} onPress={onClose}>
            <Text style={styles.noCameraBtnText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasPermission = permission === 'granted';

  if (!hasPermission) {
    return (
      <View style={styles.permissionWrapper}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Permiso de cámara</Text>
          <Text style={styles.permissionText}>
            Se necesita acceso a la cámara para escanear códigos de barras.
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={async () => {
              await requestPermission();
            }}
          >
            <Text style={styles.permissionBtnText}>Conceder permiso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cameraError) {
    return (
      <View style={styles.noCameraWrapper}>
        <View style={styles.noCameraCard}>
          <Text style={styles.noCameraTitle}>Cámara no disponible</Text>
          <Text style={styles.noCameraText}>{cameraError}</Text>
          <TouchableOpacity style={styles.noCameraBtn} onPress={onClose}>
            <Text style={styles.noCameraBtnText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        isActive={scanning}
        barCodeScannerSettings={[
          {
            barCodeFormats: [
              'ean_13',
              'ean_8',
              'code_128',
              'upc_a',
              'code_39',
              'itf_14',
            ],
          },
        ]}
        onBarCodeScanned={handleBarCodeScanned}
      />

      {/* Overlay visual: frame de escaneo */}
      <View style={styles.overlay}>
        <View style={styles.frame}>
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.hint}>Apunta al código de barras</Text>
      </View>

      {/* Controles inferiores */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btnSwitch}
          onPress={() => {
            setType(type === CameraType.back ? CameraType.front : CameraType.back);
          }}
        >
          <Text style={styles.btnText}>
            {type === CameraType.back ? 'Trasera' : 'Frontal'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onClose}>
          <Text style={styles.btnText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '88%',
    height: '58%',
    borderWidth: 2,
    borderColor: COLORS.hl,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.hl,
    shadowColor: COLORS.hl,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5,
    top: 8,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    fontSize: 13,
    color: '#cfe0d2',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  btnSwitch: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.tx,
  },
  btn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnClose: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  noCameraWrapper: {
    flex: 1,
    backgroundColor: '#0b140e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noCameraCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  noCameraTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.tx,
    marginBottom: 8,
  },
  noCameraText: {
    fontSize: 14,
    color: COLORS.mut,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  noCameraBtn: {
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  noCameraBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
  permissionWrapper: {
    flex: 1,
    backgroundColor: '#0b140e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.tx,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.mut,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionBtn: {
    backgroundColor: COLORS.pri,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  permissionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.on,
  },
});
