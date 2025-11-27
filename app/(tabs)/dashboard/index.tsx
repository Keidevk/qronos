import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- 1. PANTALLA DASHBOARD (HOME) ---
export default function HomeScreen() {
  const navigator = useNavigation();

  const dataLugares = [
    {
      id: 1,
      titulo: "Playa Paradisíaca",
      descripcion: "Un lugar hermoso con arena blanca y agua cristalina.",
      imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      titulo: "Montañas Nevadas",
      descripcion: "Perfecto para el esquí y disfrutar del aire fresco.",
      imagen: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      titulo: "Ciudad Nocturna",
      descripcion: "Luces de neón y vida nocturna vibrante.",
      imagen: "https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigator.openDrawer()}>
          {/* Icono de hamburguesa simple hecho con texto o puedes usar un Icono real */}
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{width: 30}} /> {/* Espaciador para centrar título */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Explora Lugares</Text>

        {/* Renderizado de la lista de lugares */}
        {dataLugares.map((lugar) => (
          <View key={lugar.id} style={styles.card}>
            <Image source={{ uri: lugar.imagen }} style={styles.cardImage} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{lugar.titulo}</Text>
              <Text style={styles.cardDesc}>{lugar.descripcion}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
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