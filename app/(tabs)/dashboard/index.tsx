import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// --- PALETA DE COLORES QRONNOS ---
const COLORS = {
  background: '#1a1e29', // Fondo Principal (Dark Navy)
  cardBg: '#132d46',     // Fondo de Tarjetas (Deep Blue)
  accent: '#01c38e',     // Acento Principal (Neon Mint)
  text: '#ffffff',       // Texto Blanco
  textSec: '#b0b3b8',    // Texto Gris Claro
  border: '#2a3b55'      // Bordes sutiles
};

type Category = 'Todos' | 'Restaurantes' | 'Tiendas' | 'Ferreterias' | 'Comida rapida';
const CATEGORIES: Category[] = ['Todos', 'Restaurantes', 'Tiendas', 'Ferreterias', 'Comida rapida'];
const CIUDADES = ['Todas', 'Cartagena', 'Barranquilla', 'Caracas'];

interface Lugar {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  categoria: Category;
  ciudad: string;
  descuentos?: string;
  mapLink: string;
}

const dataLugares: Lugar[] = [
  {
    id: 1,
    titulo: "C.C. San Fernando",
    descripcion: "Cl. 31 #82-267, Provincia de Cartagena, Bolívar, Colombia",
    imagen: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
    descuentos: "10% en todas las hamburguesas",
    categoria: 'Comida rapida',
    ciudad: 'Cartagena',
    mapLink: "https://maps.google.com"
  },
  {
    id: 2,
    titulo: "La Ferretería Mayor",
    descripcion: "Especialistas en herramientas y construcción.",
    imagen: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=1000&q=80",
    descuentos: "2x1 en alquiler de equipo",
    categoria: 'Ferreterias',
    ciudad: 'Cartagena',
    mapLink: "https://maps.google.com"
  },
  {
    id: 4,
    titulo: "Mega Ropa",
    descripcion: "Moda de temporada para toda la familia.",
    imagen: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    descuentos: "30% en prendas seleccionadas",
    categoria: 'Tiendas',
    ciudad: 'Caracas',
    mapLink: "https://maps.google.com"
  }
];

export default function HomeScreen() {
  const navigator: any = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
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

  return (
    <View style={styles.container}>
      {/* Cambiamos el StatusBar a light-content para que se vea sobre fondo oscuro */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER */}
      <View style={{ paddingTop: safeAreaInsets.top + 10, ...styles.header }}>
        <TouchableOpacity onPress={() => navigator.openDrawer()}>
          <Ionicons name="menu" size={32} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ECOSISTEMA <Text style={{color: COLORS.accent}}>QRONNOS</Text></Text>
        <TouchableOpacity>
           <Ionicons name="notifications-outline" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* SELECTOR DE CIUDAD */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.dropdownButton, isCityMenuOpen && styles.activeBorder]} 
            onPress={() => setIsCityMenuOpen(!isCityMenuOpen)}
          >
            <View style={styles.row}>
              <Ionicons name="location" size={20} color={COLORS.accent} />
              <Text style={styles.dropdownButtonText}>{selectedCity}</Text>
            </View>
            <Ionicons name={isCityMenuOpen ? "chevron-up" : "chevron-down"} size={20} color={COLORS.accent} />
          </TouchableOpacity>

          {isCityMenuOpen && (
            <View style={styles.dropdownList}>
              {CIUDADES.map((ciudad) => (
                <TouchableOpacity 
                  key={ciudad}
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedCity(ciudad); setIsCityMenuOpen(false); }}
                >
                  <Text style={[styles.dropdownItemText, selectedCity === ciudad && { color: COLORS.accent, fontWeight: 'bold' }]}>{ciudad}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* FILTRO CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTADO DE LOCALES */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            Destacados en <Text style={{color: COLORS.accent}}>{selectedCity}</Text>
          </Text>
          
          {filteredLugares.map((lugar) => (
            <TouchableOpacity 
              key={lugar.id} 
              onPress={() => { setSelectedLugar(lugar); setModalVisible(true); }}
              style={styles.raisedCard}
            >
              <Image source={{ uri: lugar.imagen }} style={styles.cardImg} />
              <View style={styles.cardOverlay}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{lugar.categoria.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitleText}>{lugar.titulo}</Text>
                <View style={styles.row}>
                    <Ionicons name="pin" size={14} color={COLORS.accent} />
                    <Text style={styles.cardSubText}>{lugar.ciudad}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL DETALLES */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, styles.activeBorder]}>
            <Image source={{ uri: selectedLugar?.imagen }} style={styles.modalImg} />
            
            <View style={styles.modalBody}>
              <Text style={styles.modalTitleText}>{selectedLugar?.titulo}</Text>
              
              <Text style={styles.modalLabel}>UBICACIÓN</Text>
              <Text style={styles.modalText}>{selectedLugar?.descripcion}</Text>
              
              <Text style={styles.modalLabel}>PROMOCIÓN</Text>
              <View style={styles.promoBox}>
                <Ionicons name="pricetag" size={20} color={COLORS.accent} style={{marginRight: 10}} />
                <Text style={styles.promoText}>{selectedLugar?.descuentos || "Sin promos activas"}</Text>
              </View>
              
              <TouchableOpacity onPress={() => handleOpenMaps(selectedLugar?.mapLink || '')} style={styles.mainBtn}>
                <Text style={styles.mainBtnText}>VER EN MAPA</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.secBtn}>
                <Text style={styles.secBtnText}>CERRAR</Text>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  
  // HEADER
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBg
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  
  // DROPDOWN
  dropdownContainer: { padding: 20, zIndex: 100 },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg, // Fondo oscuro
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeBorder: { borderColor: COLORS.accent, borderWidth: 1 },
  dropdownButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 10, color: COLORS.text },
  dropdownList: { 
    backgroundColor: COLORS.cardBg, 
    marginTop: 8, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: 15, color: COLORS.textSec },

  // CATEGORIAS
  categoryScroll: { paddingLeft: 20, marginBottom: 25 },
  catBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    backgroundColor: COLORS.cardBg, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catBtnActive: { 
    backgroundColor: COLORS.accent, 
    borderColor: COLORS.accent,
    // Sombra sutil neon
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  catText: { fontWeight: '600', color: COLORS.textSec },
  catTextActive: { color: '#000', fontWeight: 'bold' }, // Texto negro sobre el verde neon para contraste

  // CARDS LISTA
  listContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, color: COLORS.text },
  raisedCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginBottom: 25,
    overflow: 'hidden',
    // Sombra estilo "Glow"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  cardImg: { width: '100%', height: 180, opacity: 0.9 },
  cardOverlay: { position: 'absolute', top: 15, left: 15 },
  categoryBadge: { 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent
  },
  categoryBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cardInfo: { padding: 20 },
  cardTitleText: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  cardSubText: { fontSize: 14, color: COLORS.textSec, fontWeight: '500', marginLeft: 6 },

  // MODAL
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.background, borderRadius: 24, overflow: 'hidden', elevation: 25, borderColor: COLORS.accent, borderWidth: 1 },
  modalImg: { width: '100%', height: 220 },
  modalBody: { padding: 25 },
  modalTitleText: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 5 },
  modalLabel: { fontSize: 12, fontWeight: '800', color: COLORS.accent, marginTop: 20, letterSpacing: 1.5 },
  modalText: { fontSize: 16, color: COLORS.textSec, marginTop: 8, lineHeight: 22 },
  
  promoBox: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 195, 142, 0.1)', // Verde transparente
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: 'rgba(1, 195, 142, 0.3)',
    marginTop: 10 
  },
  promoText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  
  mainBtn: { 
    backgroundColor: COLORS.accent, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 30,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  mainBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  secBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  secBtnText: { color: COLORS.textSec, fontWeight: '600' }
});