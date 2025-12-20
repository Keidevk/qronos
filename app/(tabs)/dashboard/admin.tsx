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

  const fetchData = async () => {
    try {
      console.log("Iniciando petición a:", API_URL);
      const jwt = await SecureStore.getItemAsync('jwt')
      

      // Obtenemos empresas y métricas
      const [empresasRes, metricasRes] = await Promise.all([
        fetch(`${API_URL}/api/empresa`,{
           headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${jwt}`, // Usamos el JWT para autorización
                  },
        }),
        fetch(`${API_URL}/api/metricas`,{
          headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${jwt}`, // Usamos el JWT para autorización
                  },
        }) 
      ]);

      // --- CORRECCIÓN DE PARSEO DE DATOS ---
      
      if (empresasRes.ok) {
        const empresasData = await empresasRes.json();
        // Verificamos si es array o si viene encapsulado
        const dataFinal = Array.isArray(empresasData) ? empresasData : (empresasData.empresas || []);
        setEmpresasRaw(dataFinal);
      } else {
        console.error("Error Status Empresas:", empresasRes.status);
      }

      if (metricasRes.ok) {
        const metricasData = await metricasRes.json();
        // Verificamos si es array
        const dataFinal = Array.isArray(metricasData) ? metricasData : (metricasData.metricas || []);
        setMetricasRaw(dataFinal);
      } else {
        // Si falla métricas (posible error 401 por falta de token), iniciamos vacío para no romper la app
        console.error("Error Status Métricas:", metricasRes.status);
        setMetricasRaw([]); 
      }

    } catch (error) {
      console.error("Error de red detallado:", error);
      Alert.alert(
        "Error de Conexión", 
        "Verifica que la IP sea correcta y que tu celular esté en el mismo Wi-Fi que la PC."
      );
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

  // --- LÓGICA DE NEGOCIO ---
  const { globalStats, empresasProcesadas } = useMemo(() => {
    let gPuntos = 0;
    let gScans = 0;

    const dataProcesada: EmpresaConEstadisticas[] = empresasRaw.map((emp) => {
      // Filtramos métricas de esta empresa
      const misMetricas = metricasRaw.filter(m => m.empresa_id === emp.empresa_id);

      const totalPuntos = misMetricas.reduce((sum, m) => sum + (m.puntos || 0), 0);
      const totalScans = misMetricas.reduce((sum, m) => sum + (m.vecesScan || 0), 0);
      const clientesUnicos = misMetricas.length;

      gPuntos += totalPuntos;
      gScans += totalScans;

      return { ...emp, totalPuntos, totalScans, clientesUnicos };
    });

    return {
      globalStats: {
        puntos: gPuntos,
        scans: gScans,
        empresasActivas: empresasRaw.length
      },
      empresasProcesadas: dataProcesada
    };
  }, [empresasRaw, metricasRaw]);

  // --- COMPONENTES ---
  const KpiCard = ({ title, value, icon, color }: any) => (
    <View style={styles.kpiCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}> 
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
        <ActivityIndicator size="large" color="#000b76" />
        <Text style={{ marginTop: 10, color: '#666' }}>Conectando al servidor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={{ paddingTop: safeAreaInsets.top, ...styles.header }}>
        <TouchableOpacity onPress={() => navigator.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#000b76" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Administrativo</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.headerBtn}>
             <Ionicons name="reload" size={24} color="#000b76" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* KPI GLOBAL */}
        <Text style={styles.sectionTitle}>Resumen Global</Text>
        <View style={styles.kpiContainer}>
            <KpiCard 
                title="Puntos Totales" 
                value={globalStats.puntos.toLocaleString()} 
                icon="gift" 
                color="#00C853" 
            />
            <KpiCard 
                title="Escaneos Totales" 
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
                color="#2962FF" 
            />
        </View>

        {/* LISTADO DE EMPRESAS */}
        <Text style={styles.sectionTitle}>Empresas Registradas & Métricas</Text>
        <Text style={styles.subtitle}>
          Rendimiento en tiempo real.
        </Text>

        {empresasProcesadas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No se encontraron empresas o error de conexión.</Text>
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
                        <Text style={styles.statusText}>Activa</Text>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', zIndex: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#000b76' },
  headerBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 5, marginTop: 10 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  kpiFullRow: { marginBottom: 25 },
  kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', marginHorizontal: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  kpiTitle: { fontSize: 12, color: '#666', fontWeight: '500' },
  empresaCard: { backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 15, padding: 0, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  empresaHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  empresaIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#000b76', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  empresaIconText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  empresaTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  empresaEmail: { fontSize: 12, color: '#888' },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', width: '100%' },
  statsRow: { flexDirection: 'row', padding: 15, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  statNumberGreen: { fontSize: 18, fontWeight: 'bold', color: '#00C853' },
  statNumberOrange: { fontSize: 18, fontWeight: 'bold', color: '#FF6D00' },
  statNumberBlue: { fontSize: 18, fontWeight: 'bold', color: '#2962FF' },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#f0f0f0' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#999', marginTop: 10 }
});