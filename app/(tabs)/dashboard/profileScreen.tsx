import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// --- 2. PANTALLA PERFIL ---
export default function ProfileScreen() {
    const navigator = useNavigation();
    
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.textBase}>Módulo de Perfil</Text>
      <Text style={styles.subText}>Aquí se mostrarán los datos descargados de la BD.</Text>
      {/* TODO: Aquí harás el fetch a tu API más adelante */}
      <TouchableOpacity onPress={() => navigator.openDrawer()}>
            {/* Icono de hamburguesa simple hecho con texto o puedes usar un Icono real */}
            <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
    </View>
  );
}
// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // FONDO NEGRO SOLICITADO
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#111',
  },
  hamburgerIcon: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Contenido
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  textBase: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: '#aaa',
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
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});