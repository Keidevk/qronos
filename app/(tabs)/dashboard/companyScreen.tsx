import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// --- PALETA QRONNOS ---
const COLORS = {
  background: '#1a1e29',
  cardBg: '#132d46',
  accent: '#01c38e',
  text: '#ffffff',
  textSec: '#b0b3b8',
  border: '#2a3b55'
};

const useEmpresaCheck = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const empresaId = await SecureStore.getItemAsync('empresa_id');
                const userId = await SecureStore.getItemAsync('user_id');

                if (empresaId) {
                    setIsAuthorized(true);
                } 
                else if (!empresaId && userId) {
                    setIsAuthorized(false);
                    setErrorMessage("Tu cuenta no es de Empresa. Acceso no autorizado.");
                } 
                else {
                    setIsAuthorized(false);
                    setErrorMessage("No se encontró información de acceso. Inicia sesión nuevamente.");
                }

            } catch (error) {
                console.error("Error leyendo datos de SecureStore:", error);
                setIsAuthorized(false);
                setErrorMessage("Error al validar credenciales. Intenta nuevamente.");
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, []);

    return { isAuthorized, isLoading, errorMessage };
};

export default function CompanyScreen() {
    const navigator = useNavigation();
    const { isAuthorized, isLoading, errorMessage } = useEmpresaCheck();

    const [totalScans, setTotalScans] = useState<number | null>(null);
    const [totalPoints, setTotalPoints] = useState<number | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const empresaId = await SecureStore.getItemAsync('empresa_id');
                if (!empresaId) return;

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/metricas/empresa/${empresaId}`);
                const metricas = await response.json();

                if (Array.isArray(metricas)) {
                    const scans = metricas.reduce((acc: number, m: any) => acc + (Number(m.vecesScan) || 0), 0);
                    setTotalScans(scans);

                    const points = metricas.reduce((acc: number, m: any) => acc + (Number(m.puntos) || 0), 0);
                    setTotalPoints(points);
                } else {
                    setTotalScans(0);
                    setTotalPoints(0);
                }

            } catch (error) {
                console.error("Error al traer métricas:", error);
            }
        };

        if (isAuthorized) fetchMetrics();
    }, [isAuthorized]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={[styles.subText, { marginTop: 15 }]}>Verificando acceso...</Text>
            </View>
        );
    }

    if (!isAuthorized) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="lock-closed-outline" size={60} color={COLORS.accent} style={{marginBottom: 20}} />
                <Text style={styles.textBase}>Acceso Denegado</Text>
                <Text style={styles.subText}>
                    {errorMessage || "No tienes permisos para acceder a este módulo."}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.companyContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            <TouchableOpacity 
                onPress={() => (navigator as any).openDrawer()}
                style={{ position: "absolute", top: 50, right: 20, zIndex: 20 }}
            >
                <Ionicons name="menu" size={32} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={styles.header}>
                PANEL DE <Text style={{color: COLORS.accent}}>EMPRESA</Text>
            </Text>

            <View style={{ marginTop: 60 }}>
                {/* Visualización de Puntos */}
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                         <Ionicons name="gift-outline" size={24} color={COLORS.accent} />
                    </View>
                    <View>
                        <Text style={styles.smallTitle}>Total de puntos otorgados</Text>
                        <Text style={[styles.scanNumber, { color: COLORS.accent }]}>
                            {totalPoints !== null ? totalPoints : "..."}
                        </Text>
                    </View>
                </View>

                {/* Visualización de Escaneos */}
                <View style={styles.card}>
                    <View style={[styles.iconCircle, { borderColor: '#4F9CF9', backgroundColor: 'rgba(79, 156, 249, 0.1)' }]}>
                         <Ionicons name="qr-code-outline" size={24} color="#4F9CF9" />
                    </View>
                    <View>
                        <Text style={styles.smallTitle}>Total de escaneos</Text>
                        <Text style={[styles.scanNumber, { color: '#4F9CF9' }]}>
                            {totalScans !== null ? totalScans : "..."}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    textBase: {
         color: COLORS.text, 
         fontSize: 22, 
         fontWeight: 'bold', 
         marginBottom: 10 
    },
    subText: { 
        color: COLORS.textSec, 
        fontSize: 16, 
        textAlign: 'center' 
    },
    companyContainer: {
         flex: 1, 
         padding: 20,
         backgroundColor: COLORS.background
    },
    header: { 
        fontSize: 24, 
        fontWeight: "900", 
        color: COLORS.text,
        marginTop: 60, 
        textAlign: "left",
        letterSpacing: 1
    },
    card: { 
        backgroundColor: COLORS.cardBg, 
        padding: 25, 
        borderRadius: 20, 
        shadowColor: "#000", 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        shadowOffset: {width: 0, height: 5},
        elevation: 6, 
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(1, 195, 142, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    smallTitle: { 
        fontSize: 14,
        color: COLORS.textSec,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    scanNumber: { 
        fontSize: 36, 
        fontWeight: "bold", 
        marginTop: 2 
    },
});