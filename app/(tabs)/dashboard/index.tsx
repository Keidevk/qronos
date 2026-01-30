import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// --- PALETA DE COLORES ---
const COLORS = {
  background: '#0f1115',
  cardBg: '#181b21',
  accent: '#01c38e', 
  secondaryAccent: '#4a5568', 
  text: '#ffffff',
  textSec: '#8b9bb4',
  border: '#232936',
  overlay: 'rgba(0,0,0,0.6)'
};

const FONTS = {
  title: 'Heavitas', 
  textRegular: 'Poppins-Regular',
  textMedium: 'Poppins-Medium',
  textBold: 'Poppins-Bold'
};

// Nota: Asegúrate de que las categorías en tu Base de Datos coincidan con estas strings
type Category = 'Todos' | 'Restaurantes' | 'Tiendas' | 'Bar' | string;
const CATEGORIES: Category[] = ['Todos', 'Restaurantes', 'Bar',"Tiendas"];

const COUNTRIES_CONFIG: { [key: string]: string[] } = {
  'Colombia': ['Todas', 'Cartagena', 'Barranquilla'],
  'España': ['Todas', 'Madrid'],
};

const COUNTRIES_LIST = Object.keys(COUNTRIES_CONFIG);

// --- INTERFAZ AJUSTADA A TUS DATOS DE PRISMA ---
interface Lugar {
  id: number;           // viene de empresa_id
  titulo: string;       // viene de nombreCompleto
  descripcion: string;  // viene de descripcion
  imagen: string | null; // viene de fotoPerfil (Logo)
  categoria: string;    // viene de categoria
  pais: string;         // viene de pais
  ciudad: string;       // viene de ciudad
  descuentos?: string | null; // viene de descuento
  mapLink?: string | null;    // viene de ubicacionMaps
  
  // Fotos de la galería
  img1?: string | null; // viene de fotoDescripcion1
  img2?: string | null; // viene de fotoDescripcion2
  img3?: string | null; // viene de fotoDescripcion3
}

export default function HomeScreen() {
  const navigator: any = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  // --- ESTADOS DE DATOS API ---
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    'Heavitas': require('../../../assets/fonts/Heavitas.ttf'), 
    'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [selectedCountry, setSelectedCountry] = useState<string>('Colombia');
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);

  
const fetchLugares = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      
      // 2. Recuracion del token guardado
      const token = await SecureStore.getItemAsync('jwt'); 
      console.log("Token recuperado:", token ? "Token existe" : "TOKEN ES NULL");

      // 3. Envio el token en los headers
      const response = await fetch(`${baseUrl}/api/empresa`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await response.json();
      console.log("Datos crudos del server:", data); // Verifica que sea un Array de objeto

      // 4. VALIDACIÓN DE SEGURIDAD (Para evitar el error "map is not a function")
      if (!Array.isArray(data)) {
        console.error("Error: La API no devolvió un array. Devolvió:", data);
        // Si el token venció o es inválido, podrías redirigir al login aquí
        if (response.status === 401) {
            Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
            // navigator.navigate('Login'); 
        }
        return; 
      }
      
      const formattedData = data.map((item: any) => ({
        id: item.empresa_id, // Asegúrate que tu DB usa empresa_id o id
        titulo: item.nombreCompleto,
        descripcion: item.descripcion || "Sin descripción",
        imagen: item.fotoPerfil,
        categoria: item.categoria || 'Varios',
        pais: item.pais,
        ciudad: item.ciudad,
        descuentos: item.descuento,
        mapLink: item.ubicacionMaps,
        img1: item.fotoDescripcion1,
        img2: item.fotoDescripcion2,
        img3: item.fotoDescripcion3,
      }));
      
      console.log("Datos formateados listos:", formattedData.length);
      setLugares(formattedData);

    } catch (error) {
      console.error("Error en fetchLugares:", error);
      if(!refreshing) Alert.alert("Error", "No se pudieron cargar los aliados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLugares();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLugares();
  };

  const availableCities = useMemo(() => {
    return COUNTRIES_CONFIG[selectedCountry] || ['Todas'];
  }, [selectedCountry]);

  const filteredLugares = useMemo(() => {
    return lugares.filter(lugar => {
      // Nota: Comparamos ignorando mayúsculas/minúsculas para evitar errores
      const matchCountry = lugar.pais?.toLowerCase() === selectedCountry.toLowerCase();
      const matchCity = selectedCity === 'Todas' || lugar.ciudad?.toLowerCase() === selectedCity.toLowerCase();
      const matchCategory = selectedCategory === 'Todos' || lugar.categoria?.toLowerCase() === selectedCategory.toLowerCase();
      
      // Si quieres ser estricto con los filtros, usa return matchCountry && matchCity && matchCategory;
      // Por ahora, retornaremos true para que VEAS los datos si los filtros no coinciden exactamente
      return matchCountry && matchCity && matchCategory;
    });
  }, [selectedCategory, selectedCity, selectedCountry, lugares]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('Todas');
    setIsCountryMenuOpen(false);
  };

  const handleOpenMaps = async (mapLink?: string | null) => {
    if (!mapLink) {
        Alert.alert("Aviso", "Esta empresa no ha registrado su ubicación.");
        return;
    }
    const supported = await Linking.canOpenURL(mapLink);
    if (supported) await Linking.openURL(mapLink);
    else await Linking.openURL(mapLink); // Intentar abrir de todas formas
  };

  const getImageSource = (img: string | null | undefined) => {
    if (!img) return { uri: 'https://via.placeholder.com/400x300.png?text=Sin+Imagen' };
    return { uri: img };
  };

  if (!fontsLoaded || loading) {
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
                <Text style={styles.headerSubtitle}>ECOSISTEMA</Text>
                <Text style={styles.headerTitle}>QRONNOS</Text>
            </View>

            <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
        </View>

        <View style={styles.locationFiltersContainer}>
            <View style={{alignItems: 'flex-start', marginBottom: 8}}>
                <TouchableOpacity 
                    style={styles.countrySelectorBtn}
                    onPress={() => {
                        setIsCountryMenuOpen(!isCountryMenuOpen);
                        setIsCityMenuOpen(false);
                    }}
                >
                    <Ionicons name="globe-outline" size={14} color={COLORS.textSec} />
                    <Text style={styles.countrySelectorText}>País: <Text style={{color: COLORS.accent}}>{selectedCountry}</Text></Text>
                    <Ionicons name="chevron-down" size={12} color={COLORS.textSec} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.citySelectorBtn} 
                onPress={() => {
                    setIsCityMenuOpen(!isCityMenuOpen);
                    setIsCountryMenuOpen(false);
                }}
            >
                <Ionicons name="location-sharp" size={18} color={COLORS.accent} />
                <Text style={styles.citySelectorText}>
                    {selectedCity === 'Todas' ? `Explorar ${selectedCountry}` : selectedCity}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textSec} />
            </TouchableOpacity>
        </View>
      </View>
      
      {/* DROPDOWNS */}
      {isCountryMenuOpen && (
        <View style={[styles.floatingDropdown, { top: safeAreaInsets.top + 110 }]}>
            <Text style={styles.dropdownHeaderLabel}>Selecciona tu país</Text>
            {COUNTRIES_LIST.map((pais) => (
            <TouchableOpacity 
                key={pais}
                style={styles.dropdownItem}
                onPress={() => handleCountryChange(pais)}
            >
                <Text style={[
                    styles.dropdownText, 
                    selectedCountry === pais && { color: COLORS.accent, fontFamily: FONTS.textBold }
                ]}>
                    {pais}
                </Text>
                {selectedCountry === pais && <Ionicons name="checkmark" size={18} color={COLORS.accent}/>}
            </TouchableOpacity>
            ))}
        </View>
      )}

      {isCityMenuOpen && (
        <View style={[styles.floatingDropdown, { top: safeAreaInsets.top + 155 }]}>
            <Text style={styles.dropdownHeaderLabel}>Ciudades en {selectedCountry}</Text>
            {availableCities.map((ciudad) => (
            <TouchableOpacity 
                key={ciudad}
                style={styles.dropdownItem}
                onPress={() => { setSelectedCity(ciudad); setIsCityMenuOpen(false); }}
            >
                <Text style={[
                    styles.dropdownText, 
                    selectedCity === ciudad && { color: COLORS.accent, fontFamily: FONTS.textBold }
                ]}>
                    {ciudad}
                </Text>
                {selectedCity === ciudad && <Ionicons name="checkmark" size={18} color={COLORS.accent}/>}
            </TouchableOpacity>
            ))}
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* CATEGORIAS */}
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

        {/* LISTA DE CARDS */}
        <View style={styles.listContainer}>
          <Text style={styles.resultsText}>
            Mostrando resultados en <Text style={{color: COLORS.accent, fontFamily: FONTS.textBold}}>{selectedCountry}</Text>
             {selectedCity !== 'Todas' ? ` > ${selectedCity}` : ''}
          </Text>
          <Text style={[styles.resultsText, {marginTop: -10, fontSize: 11}]}>
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
                  {/* AQUÍ VA EL LOGO (fotoPerfil) */}
                  <Image source={getImageSource(lugar.imagen)} style={styles.cardImage} resizeMode="cover" />
                  
                  {lugar.descuentos && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{lugar.descuentos}</Text>
                    </View>
                  )}
                  <View style={styles.countryBadge}>
                        <Text style={styles.countryBadgeText}>{lugar.pais}</Text>
                  </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardCategory}>{lugar.categoria.toUpperCase()}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="pin-outline" size={14} color={COLORS.textSec} />
                        <Text style={styles.cardCity}>{lugar.ciudad}</Text>
                    </View>
                </View>
                
                <Text style={styles.cardTitle}>{lugar.titulo}</Text>
                <Text style={styles.cardDesc} numberOfLines={1}>{lugar.descripcion}</Text>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.moreInfoText}>Ver detalles</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredLugares.length === 0 && (
             <View style={{alignItems: 'center', marginTop: 30}}>
                 <Ionicons name="planet-outline" size={50} color={COLORS.border} />
                 <Text style={{color: COLORS.textSec, fontFamily: FONTS.textMedium, marginTop: 10}}>
                     No hay aliados en esta zona aún.
                 </Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DETALLE */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
            
            <View style={styles.modalCard}>
                <View style={styles.modalImageWrapper}>
                    {/* EN EL MODAL MOSTRAMOS TAMBIÉN EL LOGO EN GRANDE */}
                    <Image source={getImageSource(selectedLugar?.imagen)} style={styles.modalHeroImage} resizeMode="cover" />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                        <View style={styles.tagPill}>
                            <Text style={styles.tagText}>{selectedLugar?.categoria}</Text>
                        </View>
                        <View style={styles.cityPill}>
                            <Ionicons name="location-sharp" size={14} color={COLORS.textSec} />
                            <Text style={styles.cityText}>{selectedLugar?.ciudad}, {selectedLugar?.pais}</Text>
                        </View>
                    </View>

                    <Text style={styles.modalTitle}>{selectedLugar?.titulo}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionLabel}>ACERCA DEL LUGAR</Text>
                    <Text style={styles.modalDescription}>{selectedLugar?.descripcion}</Text>

                    {/* GALERÍA DE IMÁGENES (fotoDescripcion 1, 2, 3) */}
                    {(selectedLugar?.img1 || selectedLugar?.img2 || selectedLugar?.img3) && (
                      <View style={{marginBottom: 20}}>
                        <Text style={styles.sectionLabel}>GALERÍA</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {[selectedLugar.img1, selectedLugar.img2, selectedLugar.img3].map((img, index) => (
                            img ? <Image key={index} source={{uri: img}} style={{width: 120, height: 120, borderRadius: 12, marginRight: 10}} /> : null
                          ))}
                        </ScrollView>
                      </View>
                    )}

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

                    {/* BOTÓN DE GOOGLE MAPS */}
                    <TouchableOpacity 
                        onPress={() => handleOpenMaps(selectedLugar?.mapLink)} 
                        style={[styles.actionButton, {marginBottom: 40}]}
                    >
                        <Text style={styles.actionButtonText}>IR AHORA</Text>
                        <Ionicons name="navigate" size={20} color="#000" style={{marginLeft: 8}}/>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerSubtitle: { 
    fontFamily: FONTS.textBold, 
    fontSize: 10, 
    color: COLORS.accent, 
    letterSpacing: 3, 
    marginBottom: 2
  },
  headerTitle: { 
    fontFamily: FONTS.title, 
    fontSize: 26, 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  iconButton: { padding: 8, backgroundColor: COLORS.cardBg, borderRadius: 12 },
  locationFiltersContainer: { marginBottom: 5 },
  countrySelectorBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignSelf: 'flex-start'
  },
  countrySelectorText: {
    color: COLORS.textSec,
    fontSize: 12,
    fontFamily: FONTS.textMedium,
    marginHorizontal: 6
  },
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
  citySelectorText: { 
    flex: 1, 
    color: COLORS.text, 
    marginHorizontal: 10, 
    fontSize: 14, 
    fontFamily: FONTS.textMedium 
  },
  floatingDropdown: {
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
  dropdownHeaderLabel: {
      fontSize: 10,
      color: COLORS.textSec,
      fontFamily: FONTS.textBold,
      paddingHorizontal: 15,
      paddingVertical: 8,
      textTransform: 'uppercase'
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  dropdownText: { 
    color: COLORS.textSec, 
    fontSize: 14, 
    fontFamily: FONTS.textRegular 
  },
  categoriesContainer: { marginTop: 15, marginBottom: 10 },
  tabItem: { marginRight: 25, alignItems: 'center', paddingVertical: 5 },
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
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  resultsText: { 
    color: COLORS.textSec, 
    fontSize: 12, 
    marginBottom: 15, 
    fontFamily: FONTS.textMedium,
    letterSpacing: 0.5
  },
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
  countryBadge: {
      position: 'absolute',
      top: 10, right: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  countryBadgeText: {
      color: '#fff', fontSize: 10, fontFamily: FONTS.textMedium
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
  cardTitle: { 
    fontSize: 18, 
    color: COLORS.text, 
    marginBottom: 6,
    fontFamily: FONTS.title 
  },
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