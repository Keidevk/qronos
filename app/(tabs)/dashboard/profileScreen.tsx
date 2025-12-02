import { useFocusEffect, useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from "react";
// Importamos ActivityIndicator para mostrar carga (manteniendo tus estilos de View)
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  QrCodeSvg
} from 'react-native-qr-svg';

// --- 2. PANTALLA PERFIL ---
export default function ProfileScreen() {
  const navigator = useNavigation();
  // Inicializamos con string vacíos para evitar problemas de tipo.
  const [userIdState, setUserIdState] = useState('');
  const [nombreClienteState, setNameClienteState] = useState('');
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Maneja el estado de carga

  /**
   * 🔄 useFocusEffect: Se ejecuta cada vez que la pestaña gana foco.
   */
  useFocusEffect(
    useCallback(() => {
        let jwt = '';

      // Función principal que orquesta la carga de datos y la generación del QR
      async function loadUserDataAndGenerateQr() {
        // 1. Iniciar la carga y limpiar datos anteriores
        setIsLoading(true);
        setQrData('');
        setUserIdState('');

        let secureUserId = ''; // Variable local para pasar el ID inmediatamente
        let secureNameCliente = '';
        try {
          // --- 1. OBTENER DATOS DE SECURESTORE ---
          secureUserId = await SecureStore.getItemAsync('user_id') || '';
          secureNameCliente = await SecureStore.getItemAsync('nameCliente') || '';
          jwt = await SecureStore.getItemAsync('jwt') || '';

          console.log("Datos obtenidos de SecureStore:",jwt)

          // Actualizar estados
          setUserIdState(secureUserId);
          setNameClienteState(secureNameCliente);

          if (secureUserId) {
            console.log(`User ID encontrado: ${secureUserId}. Procediendo a generar QR.`);
            // --- 2. LLAMAR A LA API PARA GENERAR EL QR (usando la variable local) ---
            await FetchQrData(secureUserId);
          } else {
            console.log('User ID no encontrado. No se genera QR.');
          }

        } catch (error) {
          console.error('Error general en el flujo de QR/SecureStore:', error);
          setQrData('');
          setUserIdState('');
        } finally {
          // 3. Finalizar la carga
          setIsLoading(false);
        }
      }

      /**
       * Función para generar el QR mediante llamada a la API
       */
      async function FetchQrData(clientId: string) {
        if (!clientId) return; // Validación de seguridad

        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/qr/generate`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`, // Usamos el JWT para autorización
            },
            body: JSON.stringify({
              client_id: parseInt(clientId, 10),
            }),
          });
          const data = await response.json();

          if (response.ok) {
            console.log("QR Token obtenido con éxito.");
            // Actualizamos el estado con el string para el QR.
            setQrData(data.qr_token || '');
          } else {
            console.error("Error en la API de QR:", data.message || response.statusText);
            setQrData(''); // Limpiamos el QR si hubo un error
          }
        } catch (error) {
          console.error('Error al solicitar el QR:', error);
          setQrData(''); // Limpiamos el QR si hubo un error de red
        }
      }

      loadUserDataAndGenerateQr();

      // Función de limpieza
      return () => {
        console.log("Saliendo de la pestaña.");
      };
    }, [])
  );

  // ------------------------------------------------------------------
  // --- 3. Renderizado Condicional Mejorado para Evitar el Error ---
  // ------------------------------------------------------------------

  // 1. Mostrar estado de carga (mientras se buscan datos)
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  // 2. Mostrar si no hay ID O si hay ID pero no se pudo generar el string del QR (Error)
  // ¡CLAVE!: Si qrData está vacío, no intentamos renderizar el código QR.
  if (!userIdState || !qrData) {
    return (
      <View style={styles.container}>
        <View>
            <Text style={styles.nombreCliente}>
                {userIdState ? 'Error al generar QR' : 'Sesión no encontrada'}
            </Text>
            <Text style={{ textAlign: 'center', marginHorizontal: 20 }}>
                {userIdState
                    ? 'No se pudo obtener el token QR. Verifica tu conexión e intenta de nuevo.'
                    : 'No se encontró un ID de usuario. Por favor, vuelve a iniciar sesión.'
                }
            </Text>
        </View>
      </View>
    );
  }

  // 3. Mostrar el perfil y el QR (Todo está disponible: !isLoading, userIdState y qrData tienen valor)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigator.openDrawer()}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 30 }} />
      </View>
      
      <View>
        <QrCodeSvg
          style={styles.qrStyle}
          // El 'value' está garantizado como un string no vacío aquí
          value={qrData} 
          frameSize={170}
          contentCells={5}
        />
        <Text style={styles.nombreCliente}>{nombreClienteState || 'Usuario'}</Text>
      </View>
    </View>
  );
}

// -----------------------------------------------------------
// --- ESTILOS (Mantenidos EXACTAMENTE como los proporcionaste)
// -----------------------------------------------------------


// Estilos básicos de ejemplo
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nombreCliente:{
    marginHorizontal:'auto',
    marginVertical:20,
    fontSize:20,
    fontWeight:800
  },
  qrStyle:{
    backgroundColor:'rgba(255, 255, 255, 0)',
    margin:'auto'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Cabecera
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // Ajuste para SafeArea
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  hamburgerIcon: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Contenido
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  textBase: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Tarjetas (Cards) de lugares
  card: {
    backgroundColor: '#1c1c1c', // Un gris muy oscuro para contrastar con el negro
    borderRadius: 15,
    marginBottom: 25,
    overflow: 'hidden',
    elevation: 5, // Sombra para Android
    shadowColor: '#fff', // Sombra sutil para iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardTextContainer: {
    padding: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});