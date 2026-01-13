import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // Importante para las fuentes
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL; 

// --- PALETA QRONNOS (Sincronizada) ---
const COLORS = {
  background: '#0f1115',
  cardBg: '#181b21',
  accent: '#01c38e',
  text: '#ffffff',
  textSec: '#8b9bb4',
  border: '#232936'
};

// --- CONSTANTES DE FUENTES ---
const FONTS = {
  title: 'Heavitas',
  textRegular: 'Poppins-Regular',
  textMedium: 'Poppins-Medium',
  textBold: 'Poppins-Bold'
};

interface Empresa {
  empresa_id: number;
  nombreCompleto: string;
  correo: string;
}

interface Metrica {
  metrica_id: number;
  cliente_id: number;
  empresa_id: number;
  vecesScan: number;
  puntos: number;
}

interface EmpresaConEstadisticas extends Empresa {
  totalPuntos: number;
  totalScans: number;
  clientesUnicos: number;
}

export default function AdminDashboardScreen() {
  const navigator = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  const [empresasRaw, setEmpresasRaw] = useState<Empresa[]>([]);
  const [metricasRaw, setMetricasRaw] = useState<Metrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jwtState, setJwt] = useState<string | null>(null);

  // Carga de fuentes
  const [fontsLoaded] = useFonts({
    'Heavitas': require('../../../assets/fonts/Heavitas.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    const loadJwt = async () => {
      const jwt = await SecureStore.getItemAsync('jwt')
      setJwt(jwt)
    }
    loadJwt()
  }, []);

  const fetchData = async () => {
    try {
      const [empresasRes, metricasRes] = await Promise.all([
        fetch(`${API_URL}/api/empresa`,{
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtState}` },
        }),
        fetch(`${API_URL}/api/metricas`,{
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtState}` },
        }) 
      ]);

      if (empresasRes.ok) {
        const empresasData = await empresasRes.json();
        const dataFinal = Array.isArray(empresasData) ? empresasData : (empresasData.empresas || []);
        setEmpresasRaw(dataFinal);
      }

      if (metricasRes.ok) {
        const metricasData = await metricasRes.json();
        const dataFinal = Array.isArray(metricasData) ? metricasData : (metricasData.metricas || []);
        setMetricasRaw(dataFinal);
      } else {
        setMetricasRaw([]); 
      }

    } catch (error) {
      console.error("Error de red:", error);
      Alert.alert("Error", "Revisa tu conexión.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (jwtState) fetchData();
  }, [jwtState]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const { globalStats, empresasProcesadas } = useMemo(() => {
    let gPuntos = 0;
    let gScans = 0;

    const dataProcesada: EmpresaConEstadisticas[] = empresasRaw.map((emp) => {
      const misMetricas = metricasRaw.filter(m => m.empresa_id === emp.empresa_id);
      const totalPuntos = misMetricas.reduce((sum, m) => sum + (m.puntos || 0), 0);
      const totalScans = misMetricas.reduce((sum, m) => sum + (m.vecesScan || 0), 0);
      const clientesUnicos = misMetricas.length;

      gPuntos += totalPuntos;
      gScans += totalScans;

      return { ...emp, totalPuntos, totalScans, clientesUnicos };
    });

    return {
      globalStats: { puntos: gPuntos, scans: gScans, empresasActivas: empresasRaw.length },
      empresasProcesadas: dataProcesada
    };
  }, [empresasRaw, metricasRaw]);

  const KpiCard = ({ title, value, icon, color }: any) => (
    <View style={styles.kpiCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15', borderColor: color + '30' }]}> 
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={[styles.kpiValue, { color: COLORS.text }]}>{value}</Text>
        <Text style={styles.kpiTitle}>{title.toUpperCase()}</Text>
      </View>
    </View>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ marginTop: 15, color: COLORS.textSec, fontFamily: FONTS.textMedium }}>Accediendo al sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header Estilo Premium */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigator.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
            <Text style={styles.headerSubtitle}>ADMINISTRACIÓN</Text>
            <Text style={styles.headerTitle}>DASHBOARD</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.headerBtn}>
             <Ionicons name="refresh-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        
        {/* KPI GLOBAL */}
        <Text style={styles.sectionTitle}>MÉTRICAS GLOBALES</Text>
        <View style={styles.kpiGrid}>
            <View style={styles.kpiRow}>
                <KpiCard 
                    title="Puntos" 
                    value={globalStats.puntos.toLocaleString()} 
                    icon="gift-outline" 
                    color={COLORS.accent} 
                />
                <KpiCard 
                    title="Escaneos" 
                    value={globalStats.scans.toLocaleString()} 
                    icon="scan-outline" 
                    color="#FF6D00" 
                />
            </View>
            <View style={styles.kpiFullRow}>
                <KpiCard 
                    title="Empresas Activas" 
                    value={globalStats.empresasActivas} 
                    icon="business-outline" 
                    color="#4F9CF9" 
                />
            </View>
        </View>

        {/* LISTADO DE EMPRESAS */}
        <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SOCIOS COMERCIALES</Text>
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{empresasProcesadas.length}</Text>
            </View>
        </View>

        {empresasProcesadas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="server-outline" size={50} color={COLORS.border} />
            <Text style={styles.emptyText}>No se encontraron registros activos.</Text>
          </View>
        ) : (
          empresasProcesadas.map((emp) => (
            <TouchableOpacity key={emp.empresa_id} activeOpacity={0.8} style={styles.empresaCard}>
                <View style={styles.empresaHeader}>
                    <View style={styles.empresaIcon}>
                        <Text style={styles.empresaIconText}>
                          {emp.nombreCompleto ? emp.nombreCompleto.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.empresaTitle}>{emp.nombreCompleto}</Text>
                      <Text style={styles.empresaEmail}>{emp.correo.toLowerCase()}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>LIVE</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>PUNTOS</Text>
                        <Text style={styles.statNumberGreen}>{emp.totalPuntos}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ESCANEOS</Text>
                        <Text style={styles.statNumberOrange}>{emp.totalScans}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>CLIENTES</Text>
                        <Text style={styles.statNumberBlue}>{emp.clientesUnicos}</Text>
                    </View>
                </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // --- HEADER ---
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: COLORS.background,
  },
  headerSubtitle: { fontFamily: FONTS.textBold, fontSize: 10, color: COLORS.accent, letterSpacing: 3, marginBottom: 2 },
  headerTitle: { fontFamily: FONTS.title, fontSize: 20, color: COLORS.text },
  headerBtn: { 
    padding: 10, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  
  scrollContent: { padding: 20 },
  sectionTitle: { fontFamily: FONTS.textBold, fontSize: 12, color: COLORS.textSec, letterSpacing: 1.5, marginBottom: 15 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  countBadge: { backgroundColor: COLORS.border, paddingHorizontal: 8, py: 2, borderRadius: 6, marginLeft: 10, marginBottom: 15 },
  countText: { color: COLORS.text, fontSize: 10, fontFamily: FONTS.textBold },

  // --- KPI CARDS ---
  kpiGrid: { marginBottom: 25 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiFullRow: { width: '100%' },
  kpiCard: { 
    flex: 1, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 20, 
    padding: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconContainer: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1 },
  kpiValue: { fontSize: 22, fontFamily: FONTS.title },
  kpiTitle: { fontSize: 9, color: COLORS.textSec, fontFamily: FONTS.textBold, letterSpacing: 1, marginTop: 2 },
  
  // --- EMPRESA CARDS ---
  empresaCard: { 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  empresaHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 15 },
  empresaIcon: { 
    width: 46, 
    height: 46, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  empresaIconText: { color: COLORS.accent, fontFamily: FONTS.title, fontSize: 18 },
  empresaTitle: { fontSize: 16, fontFamily: FONTS.title, color: COLORS.text },
  empresaEmail: { fontSize: 12, fontFamily: FONTS.textRegular, color: COLORS.textSec, marginTop: 2 },
  
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(1, 195, 142, 0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(1, 195, 142, 0.2)'
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginRight: 5 },
  statusText: { color: COLORS.accent, fontSize: 9, fontFamily: FONTS.textBold },

  statsContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    paddingVertical: 15, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 9, color: COLORS.textSec, fontFamily: FONTS.textBold, marginBottom: 4, letterSpacing: 0.5 },
  statNumberGreen: { fontSize: 18, fontFamily: FONTS.title, color: COLORS.accent },
  statNumberOrange: { fontSize: 18, fontFamily: FONTS.title, color: '#FF6D00' },
  statNumberBlue: { fontSize: 18, fontFamily: FONTS.title, color: '#4F9CF9' },

  emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { color: COLORS.textSec, marginTop: 15, fontFamily: FONTS.textMedium }
});