import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL; 

// --- PALETA QRONNOS ---
const COLORS = {
  background: '#1a1e29',
  cardBg: '#132d46',
  accent: '#01c38e',
  text: '#ffffff',
  textSec: '#b0b3b8',
  border: '#2a3b55'
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
    fetchData();
  }, []);

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
      <View style={[styles.iconContainer, { backgroundColor: color + '20', borderColor: color }]}> 
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ marginTop: 15, color: COLORS.textSec }}>Conectando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={{ paddingTop: safeAreaInsets.top + 10, ...styles.header }}>
        <TouchableOpacity onPress={() => navigator.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADMIN <Text style={{color: COLORS.accent}}>DASHBOARD</Text></Text>
        <TouchableOpacity onPress={onRefresh} style={styles.headerBtn}>
             <Ionicons name="reload" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        
        {/* KPI GLOBAL */}
        <Text style={styles.sectionTitle}>RESUMEN GLOBAL</Text>
        <View style={styles.kpiContainer}>
            <KpiCard 
                title="Puntos Totales" 
                value={globalStats.puntos.toLocaleString()} 
                icon="gift" 
                color={COLORS.accent} 
            />
            <KpiCard 
                title="Escaneos" 
                value={globalStats.scans.toLocaleString()} 
                icon="qr-code" 
                color="#FF6D00" 
            />
        </View>
        <View style={styles.kpiFullRow}>
             <KpiCard 
                title="Empresas Registradas" 
                value={globalStats.empresasActivas} 
                icon="business" 
                color="#4F9CF9" 
            />
        </View>

        {/* LISTADO DE EMPRESAS */}
        <Text style={styles.sectionTitle}>EMPRESAS & MÉTRICAS</Text>
        <Text style={styles.subtitle}>Rendimiento en tiempo real.</Text>

        {empresasProcesadas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={50} color={COLORS.textSec} />
            <Text style={styles.emptyText}>No hay datos disponibles.</Text>
          </View>
        ) : (
          empresasProcesadas.map((emp) => (
            <View key={emp.empresa_id} style={styles.empresaCard}>
                <View style={styles.empresaHeader}>
                    <View style={styles.empresaIcon}>
                        <Text style={styles.empresaIconText}>
                          {emp.nombreCompleto ? emp.nombreCompleto.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.empresaTitle}>{emp.nombreCompleto}</Text>
                      <Text style={styles.empresaEmail}>{emp.correo}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACTIVA</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Puntos</Text>
                        <Text style={styles.statNumberGreen}>{emp.totalPuntos}</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Escaneos</Text>
                        <Text style={styles.statNumberOrange}>{emp.totalScans}</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Clientes</Text>
                        <Text style={styles.statNumberBlue}>{emp.clientesUnicos}</Text>
                    </View>
                </View>
            </View>
          ))
        )}

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  headerBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textSec, marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
  
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  kpiFullRow: { marginBottom: 30 },
  kpiCard: { 
    flex: 1, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 16, 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  kpiTitle: { fontSize: 12, color: COLORS.textSec, fontWeight: '600' },
  
  empresaCard: { 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 16, 
    marginBottom: 20, 
    padding: 0, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  empresaHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  empresaIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  empresaIconText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 18 },
  empresaTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  empresaEmail: { fontSize: 12, color: COLORS.textSec },
  statusBadge: { backgroundColor: 'rgba(1, 195, 142, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(1, 195, 142, 0.4)' },
  statusText: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: COLORS.border, width: '100%' },
  statsRow: { flexDirection: 'row', padding: 15, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, color: COLORS.textSec, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  statNumberGreen: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  statNumberOrange: { fontSize: 18, fontWeight: 'bold', color: '#FF6D00' },
  statNumberBlue: { fontSize: 18, fontWeight: 'bold', color: '#4F9CF9' },
  verticalDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textSec, marginTop: 10 }
});