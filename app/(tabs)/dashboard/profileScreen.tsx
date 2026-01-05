import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { QrCodeSvg } from 'react-native-qr-svg';

const { width } = Dimensions.get('window');

// --- PALETA QRONNOS ---
const COLORS = {
  background: '#1a1e29',
  cardBg: '#132d46',
  accent: '#01c38e',
  text: '#ffffff',
  textSec: '#b0b3b8',
};

export default function ProfileScreen() {
  const navigator: any = useNavigation();
  const [nombreClienteState, setNameClienteState] = useState('');
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadUserDataAndGenerateQr() {
        setIsLoading(true);
        setHasError(false);
        setQrData('');

        try {
          const secureUserId = await SecureStore.getItemAsync('user_id') || '';
          const secureNameCliente = await SecureStore.getItemAsync('nameCliente') || '';
          const jwt = await SecureStore.getItemAsync('jwt') || '';

          setNameClienteState(secureNameCliente);

          if (secureUserId && jwt) {
            await fetchQrData(secureUserId, jwt);
          } else {
            setHasError(true);
          }
        } catch (error) {
          console.error('Error:', error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }

      async function fetchQrData(clientId: string, token: string) {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/qr/generate`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ client_id: parseInt(clientId, 10) }),
          });
          const data = await response.json();
          if (response.ok) {
            setQrData(data.qr_token || '');
          } else {
            setHasError(true);
          }
        } catch (error) {
          setHasError(true);
        }
      }

      loadUserDataAndGenerateQr();
      return () => {};
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (hasError || !qrData) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.accent} />
        <Text style={styles.errorTitle}>Sesión Caducada o Error</Text>
        <Text style={styles.errorSub}>No pudimos generar tu código. Por favor, intenta iniciar sesión de nuevo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigator.openDrawer()} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MI PERFIL</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* TARJETA DE PERFIL QRONNOS */}
        <View style={styles.profileCard}>
          <View style={styles.neonStrip} />
          
          <Text style={styles.userName}>{nombreClienteState.toUpperCase() || 'USUARIO'}</Text>
          <Text style={styles.userLabel}>CLIENTE EXCLUSIVO</Text>

          {/* CONTENEDOR DEL QR */}
          <View style={styles.qrWrapper}>
            <QrCodeSvg
              value={qrData} 
              frameSize={200}
              contentCells={5}
              backgroundColor="white"
              color="#000"
            />
          </View>
          
          <View style={styles.scanHintContainer}>
            <Ionicons name="scan-outline" size={20} color={COLORS.accent} />
            <Text style={styles.footerNoteCard}>Escanea para identificarte</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>Presenta este código en el establecimiento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBg
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1
  },
  iconButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  profileCard: {
    width: width * 0.85,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    paddingBottom: 40,
    alignItems: 'center',
    // Glow effect neon
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  neonStrip: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.accent,
    marginBottom: 30,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  userLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: 30,
    marginTop: 5,
    opacity: 0.8
  },
  qrWrapper: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.textSec,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: COLORS.text
  },
  errorSub: {
    fontSize: 15,
    textAlign: 'center',
    color: COLORS.textSec,
    marginTop: 10,
    lineHeight: 22
  },
  scanHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    opacity: 0.9
  },
  footerNoteCard: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textSec,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerNote: {
    marginTop: 30,
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500'
  }
});