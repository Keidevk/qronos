import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font'; // Importante para las fuentes
import { useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

// --- PALETA QRONNOS (Sincronizada con Dashboard) ---
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

    // Carga de fuentes
    const [fontsLoaded] = useFonts({
        'Heavitas': require('../../../assets/fonts/Heavitas.ttf'),
        'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
    });

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

    if (!fontsLoaded || isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={[styles.subText, { marginTop: 15, fontFamily: FONTS.textMedium }]}>Verificando acceso...</Text>
            </View>
        );
    }

    if (!isAuthorized) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="lock-closed-outline" size={60} color={COLORS.accent} style={{marginBottom: 20}} />
                <Text style={styles.textBase}>ACCESO DENEGADO</Text>
                <Text style={styles.subText}>
                    {errorMessage || "No tienes permisos para acceder a este módulo."}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.companyContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* HEADER */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.welcomeText}>ESTADÍSTICAS</Text>
                    <Text style={styles.header}>
                        PANEL DE <Text style={{color: COLORS.accent}}>EMPRESA</Text>
                    </Text>
                </View>

                <TouchableOpacity 
                    onPress={() => (navigator as any).openDrawer()}
                    style={styles.iconButton}
                >
                    <Ionicons name="grid-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 40 }}>
                {/* Visualización de Puntos */}
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                         <Ionicons name="gift-outline" size={26} color={COLORS.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.smallTitle}>Puntos otorgados</Text>
                        <Text style={[styles.scanNumber, { color: COLORS.accent }]}>
                            {totalPoints !== null ? totalPoints : "0"}
                        </Text>
                    </View>
                    <Ionicons name="trending-up" size={20} color={COLORS.accent} style={{ opacity: 0.5 }} />
                </View>

                {/* Visualización de Escaneos */}
                <View style={styles.card}>
                    <View style={[styles.iconCircle, { borderColor: '#4F9CF9', backgroundColor: 'rgba(79, 156, 249, 0.1)' }]}>
                         <Ionicons name="qr-code-outline" size={26} color="#4F9CF9" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.smallTitle}>Total escaneos</Text>
                        <Text style={[styles.scanNumber, { color: '#4F9CF9' }]}>
                            {totalScans !== null ? totalScans : "0"}
                        </Text>
                    </View>
                    <Ionicons name="stats-chart" size={20} color="#4F9CF9" style={{ opacity: 0.5 }} />
                </View>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.textSec} />
                <Text style={styles.infoText}>
                    Estos datos reflejan la actividad total de los clientes identificados mediante Qronnos en tu establecimiento.
                </Text>
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
         fontFamily: FONTS.title,
         marginBottom: 10 
    },
    subText: { 
        color: COLORS.textSec, 
        fontSize: 15, 
        textAlign: 'center',
        fontFamily: FONTS.textRegular,
        lineHeight: 22
    },
    companyContainer: {
         flex: 1, 
         padding: 24,
         backgroundColor: COLORS.background
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 50,
    },
    welcomeText: {
        fontFamily: FONTS.textBold,
        fontSize: 10,
        color: COLORS.accent,
        letterSpacing: 3,
        marginBottom: 4
    },
    header: { 
        fontSize: 24, 
        fontFamily: FONTS.title,
        color: COLORS.text,
        textAlign: "left",
    },
    iconButton: { 
        padding: 10, 
        backgroundColor: COLORS.cardBg, 
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    card: { 
        backgroundColor: COLORS.cardBg, 
        padding: 24, 
        borderRadius: 24, 
        shadowColor: "#000", 
        shadowOpacity: 0.3, 
        shadowRadius: 15, 
        shadowOffset: {width: 0, height: 8},
        elevation: 8, 
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(1, 195, 142, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    smallTitle: { 
        fontSize: 11,
        color: COLORS.textSec,
        fontFamily: FONTS.textBold,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    scanNumber: { 
        fontSize: 32, 
        fontFamily: FONTS.title,
        marginTop: 2 
    },
    infoBox: {
        marginTop: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center'
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: COLORS.textSec,
        fontSize: 12,
        fontFamily: FONTS.textRegular,
        lineHeight: 18
    }
});