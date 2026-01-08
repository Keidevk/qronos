import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // IMPORTANTE: Necesario para cargar fuentes personalizadas
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// --- PALETA DE COLORES ---
const COLORS = {
  background: '#0f1115',
  cardBg: '#181b21',
  accent: '#01c38e',
  text: '#ffffff',
  textSec: '#8b9bb4',
  border: '#232936',
  overlay: 'rgba(0,0,0,0.6)'
};

// --- DEFINICIÓN DE FUENTES ---
// Usamos constantes para facilitar cambios futuros
const FONTS = {
  // Heavitas suele ser una fuente display gruesa, ideal para logotipos y títulos cortos
  title: 'Heavitas', 
  // Poppins para el resto
  textRegular: 'Poppins-Regular',
  textMedium: 'Poppins-Medium',
  textBold: 'Poppins-Bold'
};

type Category = 'Todos' | 'Restaurantes' | 'Tiendas' | 'Ferreterias' | 'Comida rapida';
const CATEGORIES: Category[] = ['Todos', 'Restaurantes', 'Tiendas', 'Ferreterias', 'Comida rapida'];
const CIUDADES = ['Todas', 'Cartagena', 'Barranquilla', 'Caracas'];

interface Lugar {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: any; 
  categoria: Category;
  ciudad: string;
  descuentos?: string;
  mapLink: string;
}

const dataLugares: Lugar[] = [
  {
    id: 5,
    titulo: "1533 Restaurante & Bar",
    descripcion: "Gastronomía histórica y coctelería de autor en el corazón de la ciudad.",
    imagen: require('../../../assets/images/1533Restaurante.png'), 
    descuentos: "10% OFF",
    categoria: 'Restaurantes',
    ciudad: 'Cartagena',
    mapLink: "https://maps.app.goo.gl/hvQafnq9fFSZujyu5" 
  },
  {
    id: 1,
    titulo: "C.C. San Fernando",
    descripcion: "Cl. 31 #82-267, Provincia de Cartagena, Bolívar, Colombia",
    imagen: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
    descuentos: "10% Hamburguesas",
    categoria: 'Comida rapida',
    ciudad: 'Cartagena',
    mapLink: "https://maps.google.com"
  },
  {
    id: 2,
    titulo: "La Ferretería Mayor",
    descripcion: "Especialistas en herramientas y construcción.",
    imagen: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=1000&q=80",
    descuentos: "2x1 Alquiler",
    categoria: 'Ferreterias',
    ciudad: 'Cartagena',
    mapLink: "https://maps.google.com"
  },
  {
    id: 4,
    titulo: "Mega Ropa",
    descripcion: "Moda de temporada para toda la familia.",
    imagen: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    descuentos: "30% Selected",
    categoria: 'Tiendas',
    ciudad: 'Caracas',
    mapLink: "https://maps.google.com"
  }
];

export default function HomeScreen() {
  const navigator: any = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  // --- CARGA DE FUENTES ---
  // Asegúrate de que los nombres coincidan con tus archivos en assets/fonts
  const [fontsLoaded] = useFonts({
    'Heavitas': require('../../../assets/fonts/Heavitas.ttf'), 
    'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);

  const filteredLugares = useMemo(() => {
    return dataLugares.filter(lugar => {
      const matchCity = selectedCity === 'Todas' || lugar.ciudad === selectedCity;
      const matchCategory = selectedCategory === 'Todos' || lugar.categoria === selectedCategory;
      return matchCity && matchCategory;
    });
  }, [selectedCategory, selectedCity]);

  const handleOpenMaps = async (mapLink: string) => {
    const supported = await Linking.canOpenURL(mapLink);
    if (supported) await Linking.openURL(mapLink);
    else Alert.alert("Error", "No se pudo abrir el mapa.");
  };

  const getImageSource = (img: any) => {
    return typeof img === 'string' ? { uri: img } : img;
  };

  // Pantalla de carga mientras suben las fuentes
  if (!fontsLoaded) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigator.openDrawer()} style={styles.iconButton}>
                <Ionicons name="grid-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
                {/* Subtítulo en Poppins Bold para contraste */}
                <Text style={styles.headerSubtitle}>ECOSISTEMA</Text>
                {/* Título principal en Heavitas */}
                <Text style={styles.headerTitle}>QRONNOS</Text>
            </View>

            <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
        </View>

        {/* SELECTOR DE CIUDAD */}
        <View style={styles.cityFilterContainer}>
            <TouchableOpacity 
                style={styles.citySelectorBtn} 
                onPress={() => setIsCityMenuOpen(!isCityMenuOpen)}
            >
                <Ionicons name="location-sharp" size={18} color={COLORS.accent} />
                <Text style={styles.citySelectorText}>
                    {selectedCity === 'Todas' ? 'Explorar todas las ciudades' : selectedCity}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textSec} />
            </TouchableOpacity>
        </View>
      </View>
      
      {/* MENÚ FLOTANTE CIUDAD */}
      {isCityMenuOpen && (
        <View style={[styles.cityDropdown, { top: safeAreaInsets.top + 115 }]}>
            {CIUDADES.map((ciudad) => (
            <TouchableOpacity 
                key={ciudad}
                style={styles.cityDropdownItem}
                onPress={() => { setSelectedCity(ciudad); setIsCityMenuOpen(false); }}
            >
                <Text style={[
                    styles.cityDropdownText, 
                    selectedCity === ciudad && { color: COLORS.accent, fontFamily: FONTS.textBold }
                ]}>
                    {ciudad}
                </Text>
                {selectedCity === ciudad && <Ionicons name="checkmark" size={18} color={COLORS.accent}/>}
            </TouchableOpacity>
            ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* TABS CATEGORÍAS */}
        <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.tabItem}
                >
                <Text style={[styles.tabText, selectedCategory === cat && styles.tabTextActive]}>
                    {cat}
                </Text>
                {selectedCategory === cat && <View style={styles.activeDot} />}
                </TouchableOpacity>
            ))}
            </ScrollView>
        </View>

        {/* LISTADO */}
        <View style={styles.listContainer}>
          <Text style={styles.resultsText}>
            {filteredLugares.length} {filteredLugares.length === 1 ? 'Aliado encontrado' : 'Aliados encontrados'}
          </Text>
          
          {filteredLugares.map((lugar) => (
            <TouchableOpacity 
              key={lugar.id} 
              onPress={() => { setSelectedLugar(lugar); setModalVisible(true); }}
              activeOpacity={0.9}
              style={styles.proCard}
            >
              <View style={styles.imageContainer}>
                  <Image source={getImageSource(lugar.imagen)} style={styles.cardImage} resizeMode="cover" />
                  
                  {lugar.descuentos && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{lugar.descuentos}</Text>
                    </View>
                  )}
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardCategory}>{lugar.categoria.toUpperCase()}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="pin-outline" size={14} color={COLORS.textSec} />
                        <Text style={styles.cardCity}>{lugar.ciudad}</Text>
                    </View>
                </View>
                
                {/* Título en Heavitas */}
                <Text style={styles.cardTitle}>{lugar.titulo}</Text>
                {/* Descripción en Poppins Regular */}
                <Text style={styles.cardDesc} numberOfLines={1}>{lugar.descripcion}</Text>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.moreInfoText}>Ver detalles</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
            
            <View style={styles.modalCard}>
                <View style={styles.modalImageWrapper}>
                    <Image source={getImageSource(selectedLugar?.imagen)} style={styles.modalHeroImage} />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.tagPill}>
                            <Text style={styles.tagText}>{selectedLugar?.categoria}</Text>
                        </View>
                        <View style={styles.cityPill}>
                            <Ionicons name="location-sharp" size={14} color={COLORS.textSec} />
                            <Text style={styles.cityText}>{selectedLugar?.ciudad}</Text>
                        </View>
                    </View>

                    {/* Título Modal en Heavitas */}
                    <Text style={styles.modalTitle}>{selectedLugar?.titulo}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionLabel}>ACERCA DEL LUGAR</Text>
                    <Text style={styles.modalDescription}>{selectedLugar?.descripcion}</Text>

                    {selectedLugar?.descuentos ? (
                        <View style={styles.couponContainer}>
                            <View style={styles.couponLeft}>
                                <Ionicons name="gift-outline" size={24} color={COLORS.accent} />
                            </View>
                            <View style={styles.couponRight}>
                                <Text style={styles.couponTitle}>Beneficio Qronnos</Text>
                                <Text style={styles.couponValue}>{selectedLugar.descuentos}</Text>
                            </View>
                        </View>
                    ) : null}

                    <TouchableOpacity 
                        onPress={() => handleOpenMaps(selectedLugar?.mapLink || '')} 
                        style={styles.actionButton}
                    >
                        <Text style={styles.actionButtonText}>IR AHORA</Text>
                        <Ionicons name="navigate" size={20} color="#000" style={{marginLeft: 8}}/>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // --- HEADER ---
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  // Subtítulo: Poppins Bold (pequeño y espaciado)
  headerSubtitle: { 
    fontFamily: FONTS.textBold, 
    fontSize: 10, 
    color: COLORS.accent, 
    letterSpacing: 3, 
    marginBottom: 2
  },
  // Título: Heavitas (Grande y sólido)
  headerTitle: { 
    fontFamily: FONTS.title, 
    fontSize: 26, 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  iconButton: { padding: 8, backgroundColor: COLORS.cardBg, borderRadius: 12 },
  
  // --- CITY SELECTOR ---
  cityFilterContainer: { marginBottom: 5 },
  citySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  // Selector Texto: Poppins Medium
  citySelectorText: { 
    flex: 1, 
    color: COLORS.text, 
    marginHorizontal: 10, 
    fontSize: 14, 
    fontFamily: FONTS.textMedium 
  },
  
  // --- CITY DROPDOWN ---
  cityDropdown: {
    position: 'absolute',
    left: 20, right: 20,
    backgroundColor: '#232936',
    borderRadius: 12,
    padding: 5,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cityDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  cityDropdownText: { 
    color: COLORS.textSec, 
    fontSize: 14, 
    fontFamily: FONTS.textRegular 
  },

  // --- CATEGORIES (Tabs) ---
  categoriesContainer: { marginTop: 15, marginBottom: 10 },
  tabItem: { marginRight: 25, alignItems: 'center', paddingVertical: 5 },
  
  // Tabs Texto: Poppins Medium (Inactivo) vs Bold (Activo)
  tabText: { 
    fontSize: 14, 
    color: COLORS.textSec, 
    fontFamily: FONTS.textMedium 
  },
  tabTextActive: { 
    color: COLORS.text, 
    fontFamily: FONTS.textBold 
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 4 },

  // --- LIST ---
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  resultsText: { 
    color: COLORS.textSec, 
    fontSize: 12, 
    marginBottom: 15, 
    fontFamily: FONTS.textMedium,
    letterSpacing: 0.5
  },
  
  // --- PRO CARD ---
  proCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  imageContainer: { height: 180, width: '100%', position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    bottom: 10, left: 10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6
  },
  discountText: { 
    color: '#000', 
    fontFamily: FONTS.textBold, 
    fontSize: 12 
  },
  
  cardContent: { padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardCategory: { 
    fontSize: 10, 
    color: COLORS.accent, 
    fontFamily: FONTS.textBold, 
    letterSpacing: 1 
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  cardCity: { 
    fontSize: 12, 
    color: COLORS.textSec, 
    marginLeft: 4, 
    fontFamily: FONTS.textMedium 
  },
  
  // Titulo Card: Heavitas
  cardTitle: { 
    fontSize: 18, 
    color: COLORS.text, 
    marginBottom: 6,
    fontFamily: FONTS.title 
  },
  // Descripcion: Poppins Regular
  cardDesc: { 
    fontSize: 13, 
    color: COLORS.textSec, 
    marginBottom: 14, 
    fontFamily: FONTS.textRegular 
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  moreInfoText: { 
    color: COLORS.accent, 
    fontSize: 13, 
    fontFamily: FONTS.textBold, 
    marginRight: 5 
  },

  // --- MODAL ---
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalCard: {
    height: '85%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden'
  },
  modalImageWrapper: { height: 250, width: '100%', position: 'relative' },
  modalHeroImage: { width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute', top: 15, right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, padding: 8
  },
  modalContent: { flex: 1, padding: 25 },
  modalHeader: { flexDirection: 'row', marginBottom: 15 },
  tagPill: { backgroundColor: COLORS.cardBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  tagText: { color: COLORS.text, fontSize: 11, fontFamily: FONTS.textBold },
  cityPill: { flexDirection: 'row', alignItems: 'center' },
  cityText: { color: COLORS.textSec, fontSize: 13, marginLeft: 5, fontFamily: FONTS.textMedium },
  
  // Titulo Modal: Heavitas (Grande)
  modalTitle: { 
    fontSize: 24, 
    color: COLORS.text, 
    marginBottom: 10,
    fontFamily: FONTS.title
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  sectionLabel: { 
    fontSize: 11, 
    color: COLORS.textSec, 
    marginBottom: 8, 
    letterSpacing: 1,
    fontFamily: FONTS.textBold 
  },
  modalDescription: { 
    fontSize: 15, 
    color: '#bdc1c6', 
    lineHeight: 24, 
    marginBottom: 25,
    fontFamily: FONTS.textRegular 
  },
  
  couponContainer: {
    flexDirection: 'row',
    backgroundColor: '#131f1c',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(1, 195, 142, 0.3)',
    borderStyle: 'dashed'
  },
  couponLeft: { marginRight: 15 },
  couponRight: { flex: 1 },
  couponTitle: { 
    color: COLORS.accent, 
    fontSize: 11, 
    fontFamily: FONTS.textBold, 
    textTransform: 'uppercase' 
  },
  couponValue: { 
    color: COLORS.text, 
    fontSize: 16, 
    fontFamily: FONTS.textBold,
    marginTop: 2
  },

  actionButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  actionButtonText: { 
    color: '#000', 
    fontSize: 16, 
    fontFamily: FONTS.textBold, 
    letterSpacing: 0.5 
  }
});