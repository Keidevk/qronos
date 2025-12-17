import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Obtener la altura de la ventana para el modal
const { height: screenHeight } = Dimensions.get('window');

// --- CONSTANTES ---
type Category = 'Todos' | 'Restaurantes' | 'Tiendas' | 'Ferreterias' | 'Comida rapida';
const CATEGORIES: Category[] = ['Todos', 'Restaurantes', 'Tiendas', 'Ferreterias', 'Comida rapida'];

// Definición de la estructura de datos actualizada
interface Lugar {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  categoria: Category;
  descuentos?: string;
  mapLink: string;
}

// Datos de lugares
const dataLugares: Lugar[] = [
  {
    id: 1,
    titulo: "McDonalsd's",
    descripcion: "Orlando (6875 Sand Lake Rd)",
    imagen: "https://media.istockphoto.com/id/1371448871/es/foto/edificio-del-restaurante-mcdonalds-exterior.jpg?s=1024x1024&w=is&k=20&c=bm62o_KhANB6wS_f2D0oN-eWtar7r-HPsy5-TCrwu4o=",
    descuentos: "10% en todas las hamburguesas",
    categoria: 'Comida rapida',
    mapLink: "http://maps.google.com/?q=6875+Sand+Lake+Rd+Orlando"
  },
  {
    id: 2,
    titulo: "La Ferretería Mayor",
    descripcion: "Especialistas en herramientas y construcción.",
    imagen: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    descuentos: "2x1 en alquiler de equipo",
    categoria: 'Ferreterias',
    mapLink: "http://maps.google.com/?q=Ferreteria+Mayor"
  },
  {
    id: 3,
    titulo: "City Lights Bistro",
    descripcion: "Cenas elegantes y vida nocturna vibrante.",
    imagen: "https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    descuentos: "Bebida gratis en la primera hora",
    categoria: 'Restaurantes',
    mapLink: "http://maps.google.com/?q=City+Lights+Bistro"
  },
  {
    id: 4,
    titulo: "Mega Ropa y Accesorios",
    descripcion: "Moda de temporada para toda la familia.",
    imagen: "https://scontent.fmar2-1.fna.fbcdn.net/v/t39.30808-6/300000407_493837859411423_1843026343596638305_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=-PpDk91wLVsQ7kNvwFh6389&_nc_oc=AdlEnrIq3bcqOszEKrsCbRNd65mDzuilprwaohV_TqnaiXiS4MlkOiPcqI6nabALuGQ&_nc_zt=23&_nc_ht=scontent.fmar2-1.fna&_nc_gid=EIwOxO0ZaSfgSEAEZwsFCw&oh=00_Afl9pOoJFEyJX0bNrwcSWnSWwa9A4Gb_FVx2nt7JCmEThg&oe=6948002E",
    descuentos: "30% en prendas seleccionadas",
    categoria: 'Tiendas',
    mapLink: "http://maps.google.com/?q=Mega+Ropa"
  },
  {
    id: 5,
    titulo: "Tacos El Rey",
    descripcion: "Los mejores tacos de la ciudad.",
    imagen: "https://degusta-pictures-hd.b-cdn.net/1_107401_r_0.jpg?v=1670",
    descuentos: "Tacos al pastor 3x2",
    categoria: 'Comida rapida',
    mapLink: "http://maps.google.com/?q=Tacos+El+Rey"
  },
];


// --- 1. PANTALLA DASHBOARD (HOME) ---
export default function HomeScreen() {
  const navigator = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');

  const filteredLugares = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return dataLugares;
    }
    return dataLugares.filter(lugar => lugar.categoria === selectedCategory);
  }, [selectedCategory]);


  /**
   * Abre la URL del mapa en la aplicación nativa del teléfono.
   */
  const handleOpenMaps = async (mapLink: string) => {
    if (!mapLink) {
        Alert.alert("Error", "No se proporcionó un enlace de mapa para este local.");
        return;
    }
    const supported = await Linking.canOpenURL(mapLink);
    if (supported) {
      await Linking.openURL(mapLink);
    } else {
      Alert.alert(`No se pudo abrir el mapa`, `Asegúrate de tener una aplicación de mapas instalada. Enlace: ${mapLink}`);
    }
  };


  const openCard = (lugar: Lugar) => {
    setSelectedLugar(lugar);
    setModalVisible(true);
  };

  const closeCard = () => {
    setModalVisible(false);
    setSelectedLugar(null);
  };


  // --- COMPONENTE MODAL DE DETALLES ---
  const DetailsModal = () => {
    if (!selectedLugar) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeCard}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            
            <Image source={{ uri: selectedLugar.imagen }} style={styles.modalImage} />

            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTitle}>{selectedLugar.titulo}</Text>
              
              <Text style={styles.modalInfoTitle}>Lugar:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.descripcion}</Text>

              <Text style={styles.modalInfoTitle}>Descuentos:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.descuentos || "No hay descuentos disponibles."}</Text>

              <Text style={styles.modalInfoTitle}>Categoría:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.categoria}</Text>
            </View>
            
            {/* BOTÓN IR A (Navegación GPS) */}
            <TouchableOpacity 
                onPress={() => handleOpenMaps(selectedLugar.mapLink)} 
                style={styles.mapButton}
            >
                <Text style={styles.mapButtonText}>IR A</Text>
            </TouchableOpacity>

            {/* Botón para cerrar */}
            <TouchableOpacity onPress={closeCard} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>CERRAR</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    );
  };
  
  // --- COMPONENTE FILTRO DE CATEGORÍAS (MEJORADO) ---
  const CategoryFilter = () => (
    <View style={styles.categoryFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryListContent}
      >
        {CATEGORIES.map((category, index) => {
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                isActive && styles.categoryButtonActive,
                // Añadimos un margen extra al último elemento para que no pegue al borde
                index === CATEGORIES.length - 1 && { marginRight: 20 }
              ]}
            >
              <Text style={[
                styles.categoryButtonText,
                isActive && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Cabecera */}
      <View style={{ paddingTop: safeAreaInsets.top, ...styles.header }}>
        <TouchableOpacity 
          onPress={() => navigator.openDrawer()}
          style={styles.hamburgerButton}
        >
          <Ionicons name="menu" size={30} color="#000b76" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{width: 30}} /> 
      </View>
      
      {/* Filtro de Categorías */}
      <CategoryFilter />

      {/* Contenido Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Explora Locales</Text>

        {filteredLugares.map((lugar) => (
          <TouchableOpacity 
            key={lugar.id} 
            onPress={() => openCard(lugar)}
            style={styles.cardShadowContainer}
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              <Image source={{ uri: lugar.imagen }} style={styles.cardImage} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{lugar.titulo}</Text> 
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filteredLugares.length === 0 && (
          <Text style={styles.noResultsText}>No hay locales en esta categoría.</Text>
        )}
        <View style={{height: 40}} />
      </ScrollView>

      {/* Renderizado del Modal de Detalles */}
      <DetailsModal />
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  // --- Estilos de la pantalla principal ---
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hamburgerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000b76', 
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: '700',
    color: '#333333',
  },
  scrollContent: {
    padding: 20,
  },

  // --- 🔥 ESTILOS NUEVOS Y ARREGLADOS PARA EL FILTRO ---
  categoryFilterContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  categoryListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10, // Espacio para que se vea la sombra
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#F4F6F8', // Gris suave moderno
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Píldora redondeada
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#000b76',
    borderColor: '#000b76',
    // Sombra suave (Efecto 3D)
    shadowColor: "#000b76",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  categoryButtonText: {
    color: '#637381',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  // --------------------------------------------------------

  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  
  // --- Estilos de las Tarjetas ---
  cardShadowContainer: {
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8, 
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    overflow: 'hidden',
    minHeight: 180,
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardTextContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cardTitle: {
    color: '#000b76',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // --- Estilos del Modal ---
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: screenHeight * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalTextContainer: {
    padding: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000b76',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  
  // Estilos para el botón IR A
  mapButton: {
    backgroundColor: '#000b76',
    paddingVertical: 15,
    marginHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Estilo del botón CERRAR
  closeButton: {
    backgroundColor: '#e52222ff',
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});