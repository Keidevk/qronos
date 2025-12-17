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

// Definimos las ciudades disponibles. 'Todas' sirve para ver el mapa global.
const CIUDADES = ['Todas', 'Cartagena', 'Barranquilla', 'Caracas'];

// Definición de la estructura de datos actualizada (AHORA INCLUYE CIUDAD)
interface Lugar {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  categoria: Category;
  ciudad: string; // <--- Nuevo Campo
  descuentos?: string;
  mapLink: string;
}

// Datos de lugares actualizados con ciudades
const dataLugares: Lugar[] = [
  {
    id: 1,
    titulo: "Centro comercial San Fernando",
    descripcion: "Cl. 31 #82-267, Ternera, Cartagena de Indias, Provincia de Cartagena, Bolívar, Colombia",
    imagen: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSypg1XgM4pAHcyX3DLF8jq0xS_uKyvtSkLxBxMcvMj7x6i6GlHYaaL1MwqN6yD7B2buHoXCS5mibewX36JXbWkYKJBtH8lif-sqaVm_Zy-tvA0XrLUs4V9bVZC2xLI4zs7R-HrGHWLPJobB=w426-h240-k-no",
    descuentos: "10% en todas las hamburguesas",
    categoria: 'Comida rapida',
    ciudad: 'Cartagena', // <--- Ciudad asignada
    mapLink: "https://maps.app.goo.gl/amS9VwAasfbboBqQ8"
  },
  {
    id: 2,
    titulo: "La Ferretería Mayor",
    descripcion: "Especialistas en herramientas y construcción.",
    imagen: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    descuentos: "2x1 en alquiler de equipo",
    categoria: 'Ferreterias',
    ciudad: 'Cartagena',
    mapLink: "http://maps.google.com/?q=Ferreteria+Mayor"
  },
  {
    id: 3,
    titulo: "City Lights Bistro",
    descripcion: "Cenas elegantes y vida nocturna vibrante.",
    imagen: "https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    descuentos: "Bebida gratis en la primera hora",
    categoria: 'Restaurantes',
    ciudad: 'Barranquilla',
    mapLink: "http://maps.google.com/?q=City+Lights+Bistro"
  },
  {
    id: 4,
    titulo: "Mega Ropa y Accesorios",
    descripcion: "Moda de temporada para toda la familia.",
    imagen: "https://scontent.fmar2-1.fna.fbcdn.net/v/t39.30808-6/300000407_493837859411423_1843026343596638305_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=-PpDk91wLVsQ7kNvwFh6389&_nc_oc=AdlEnrIq3bcqOszEKrsCbRNd65mDzuilprwaohV_TqnaiXiS4MlkOiPcqI6nabALuGQ&_nc_zt=23&_nc_ht=scontent.fmar2-1.fna&_nc_gid=EIwOxO0ZaSfgSEAEZwsFCw&oh=00_Afl9pOoJFEyJX0bNrwcSWnSWwa9A4Gb_FVx2nt7JCmEThg&oe=6948002E",
    descuentos: "30% en prendas seleccionadas",
    categoria: 'Tiendas',
    ciudad: 'Caracas',
    mapLink: "http://maps.google.com/?q=Mega+Ropa"
  },
  {
    id: 5,
    titulo: "Tacos El Rey",
    descripcion: "Los mejores tacos de la ciudad.",
    imagen: "https://degusta-pictures-hd.b-cdn.net/1_107401_r_0.jpg?v=1670",
    descuentos: "Tacos al pastor 3x2",
    categoria: 'Comida rapida',
    ciudad: 'Barranquilla',
    mapLink: "http://maps.google.com/?q=Tacos+El+Rey"
  },
];


// --- 1. PANTALLA DASHBOARD (HOME) ---
export default function HomeScreen() {
  const navigator = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [selectedCity, setSelectedCity] = useState<string>('Todas'); // Por defecto muestra todas
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false); // Controla si el menú desplegable está abierto

  // --- LÓGICA DE FILTRADO (DOBLE FILTRO) ---
  const filteredLugares = useMemo(() => {
    return dataLugares.filter(lugar => {
      // 1. Filtrar por Ciudad
      const matchCity = selectedCity === 'Todas' || lugar.ciudad === selectedCity;
      // 2. Filtrar por Categoría
      const matchCategory = selectedCategory === 'Todos' || lugar.categoria === selectedCategory;
      
      return matchCity && matchCategory;
    });
  }, [selectedCategory, selectedCity]);


  const handleOpenMaps = async (mapLink: string) => {
    if (!mapLink) {
        Alert.alert("Error", "No se proporcionó un enlace de mapa para este local.");
        return;
    }
    const supported = await Linking.canOpenURL(mapLink);
    if (supported) {
      await Linking.openURL(mapLink);
    } else {
      Alert.alert(`No se pudo abrir el mapa`, `Asegúrate de tener una aplicación de mapas instalada.`);
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

  // --- COMPONENTE SELECTOR DE CIUDAD (DROPDOWN) ---
  const CityDropdown = () => (
    <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Selecciona tu ciudad:</Text>
        
        <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setIsCityMenuOpen(!isCityMenuOpen)}
            activeOpacity={0.8}
        >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="location-sharp" size={20} color="#000b76" style={{marginRight: 8}} />
                <Text style={styles.dropdownButtonText}>{selectedCity}</Text>
            </View>
            <Ionicons 
                name={isCityMenuOpen ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
            />
        </TouchableOpacity>

        {/* Lista desplegable */}
        {isCityMenuOpen && (
            <View style={styles.dropdownList}>
                {CIUDADES.map((ciudad) => (
                    <TouchableOpacity 
                        key={ciudad}
                        style={[
                            styles.dropdownItem,
                            selectedCity === ciudad && styles.dropdownItemActive
                        ]}
                        onPress={() => {
                            setSelectedCity(ciudad);
                            setIsCityMenuOpen(false);
                        }}
                    >
                        <Text style={[
                            styles.dropdownItemText,
                            selectedCity === ciudad && styles.dropdownItemTextActive
                        ]}>
                            {ciudad}
                        </Text>
                        {selectedCity === ciudad && (
                            <Ionicons name="checkmark" size={18} color="#000b76" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        )}
    </View>
  );

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
              
              <Text style={styles.modalInfoTitle}>Ubicación:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.ciudad} - {selectedLugar.descripcion}</Text>

              <Text style={styles.modalInfoTitle}>Descuentos:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.descuentos || "No hay descuentos disponibles."}</Text>

              <Text style={styles.modalInfoTitle}>Categoría:</Text>
              <Text style={styles.modalInfoText}>{selectedLugar.categoria}</Text>
            </View>
            
            <TouchableOpacity 
                onPress={() => handleOpenMaps(selectedLugar.mapLink)} 
                style={styles.mapButton}
            >
                <Text style={styles.mapButtonText}>IR A</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeCard} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>CERRAR</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    );
  };
  
  // --- COMPONENTE FILTRO DE CATEGORÍAS ---
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
      
      {/* 1. SELECCIÓN DE CIUDAD (NUEVO) */}
      <CityDropdown />

      {/* 2. FILTRO DE CATEGORÍAS */}
      <CategoryFilter />

      {/* 3. LISTA DE LOCALES */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.resultsHeader}>
            <Text style={styles.welcomeText}>Locales en {selectedCity}</Text>
        </View>

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
                <Text style={styles.cardCity}>{lugar.ciudad}</Text> 
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredLugares.length === 0 && (
          <View style={styles.noResultsContainer}>
             <Ionicons name="search" size={50} color="#ccc" />
             <Text style={styles.noResultsText}>No hay locales en {selectedCity} con esta categoría.</Text>
          </View>
        )}
        <View style={{height: 40}} />
      </ScrollView>

      <DetailsModal />
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
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
    zIndex: 10,
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
  
  // --- ESTILOS DEL DROPDOWN (NUEVO) ---
  dropdownContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
    zIndex: 5, // Importante para superponer visualmente si usaras position absolute, aunque aquí usamos layout flow
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    marginTop: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    // Sombra para el menú
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItemActive: {
    backgroundColor: '#f0f4ff', // Fondo suave azul cuando está activo
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextActive: {
    color: '#000b76',
    fontWeight: 'bold',
  },

  // -------------------------------------

  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  resultsHeader: {
    marginBottom: 20,
  },
  scrollContent: {
    padding: 20,
  },

  categoryFilterContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  categoryListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10, 
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#F4F6F8', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#000b76',
    borderColor: '#000b76',
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

  noResultsContainer: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.7,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
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
    paddingVertical: 12,
  },
  cardTitle: {
    color: '#000b76',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCity: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: screenHeight * 0.85,
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