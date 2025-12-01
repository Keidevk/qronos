import { useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

/**
 * Hook que valida acceso según:
 * - empresa_id → autorizado
 * - user_id sin empresa_id → acceso NO autorizado
 */
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
    const scheme = useColorScheme();
    const dark = scheme === "dark";

    const [totalScans, setTotalScans] = useState<number | null>(null);

    // Traer total de escaneos de la empresa
    useEffect(() => {
        const fetchTotalScans = async () => {
            try {
                const empresaId = await SecureStore.getItemAsync('empresa_id');
                if (!empresaId) return;

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/metricas/empresa/${empresaId}`);
                const metricas = await response.json();

                // Sumar todas las vecesScan
                const total = metricas.reduce((acc: number, m: any) => acc + m.vecesScan, 0);
                setTotalScans(total);

            } catch (error) {
                console.error("Error al traer total de escaneos:", error);
            }
        };

        fetchTotalScans();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={[styles.subText, { marginTop: 15 }]}>Verificando acceso...</Text>
            </View>
        );
    }

    if (!isAuthorized) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.textBase}>🚫 Acceso Denegado</Text>
                <Text style={styles.subText}>
                    {errorMessage || "No tienes permisos para acceder a este módulo."}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.companyContainer, { backgroundColor: dark ? "#0D0D0D" : "#F3F4F6" }]}>
            <TouchableOpacity 
                onPress={() => navigator.openDrawer()}
                style={{ position: "absolute", top: 50, right: 20, zIndex: 20 }}
            >
                <Text style={{ fontSize: 30, color: dark ? "#fff" : "#000" }}>☰</Text>
            </TouchableOpacity>

            <Text style={[styles.header, { top: 40, color: dark ? "#FFFFFF" : "#1F2937" }]}>
                Panel de Empresa
            </Text>

            <View style={[styles.card, { backgroundColor: dark ? "#1A1A1A" : "#FFFFFF", shadowOpacity: dark ? 0 : 0.1 }]}>
                <Text style={[styles.smallTitle, { color: dark ? "#AAAAAA" : "#6B7280" }]}>
                    Total de escaneos
                </Text>
                <Text style={[styles.scanNumber, { color: dark ? "#4F9CF9" : "#2563EB" }]}>
                    {totalScans !== null ? totalScans : "Cargando..."}
                </Text>
            </View>
        </View>
    );
}

/* ------------------ ESTILOS ------------------ */
const styles = StyleSheet.create({
    centerContainer: {
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
    },
    textBase: {
         color: '#fff', 
         fontSize: 22, 
         fontWeight: 'bold', 
         marginBottom: 10 
    },
    subText: { 
        color: '#aaa', 
        fontSize: 16, 
        textAlign: 'center' 

    },
    companyContainer: {
         flex: 1, 
         padding: 20,
    },
    header: { 
        fontSize: 26, 
        fontWeight: "bold", 
        marginBottom: 20, 
        marginTop: 40, 
        textAlign: "center" 
    },
    card: { 
        backgroundColor: "#fff", 
        padding: 18, 
        borderRadius: 20, 
        shadowColor: "#000", 
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        elevation: 4, 
        marginBottom: 25,
        marginTop: 220
    },

    smallTitle: { 
        fontSize: 16 
    },
    
    scanNumber: { 
        fontSize: 42, 
        fontWeight: "bold", 
        marginTop: 3 
    },
});
