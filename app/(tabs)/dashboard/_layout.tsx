import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

// PALETA DE COLORES QRONNOS (Sincronizada)
const COLORS = {
    background: '#0f1115', 
    cardBg: '#181b21',     
    accent: '#01c38e',     
    text: '#ffffff',       
    textSec: '#8b9bb4',    
    border: '#232936'      
};

export default function TabLayout() {
    const router = useRouter();
    const [empresaState, setEmpresaState] = useState(false);
    const [adminState, setAdminState] = useState(false);

    // Carga de fuentes para la tipografía de la barra
    const [fontsLoaded] = useFonts({
        'Heavitas': require('../../../assets/fonts/Heavitas.ttf'),
        'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
    });

    // Verificación de credenciales
    useFocusEffect(
        useCallback(() => {
            const checkAuth = async () => {
                const empresa_id = await SecureStore.getItemAsync('empresa_id');
                const admin = await SecureStore.getItemAsync('rol');
                
                setEmpresaState(!!empresa_id);
                setAdminState(admin === 'Admin');
            };
            checkAuth();
        }, [])
    );

    // Función de cierre de sesión
    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sí, salir", 
                style: "destructive",
                onPress: async () => {
                    await SecureStore.deleteItemAsync('empresa_id');
                    await SecureStore.deleteItemAsync('user_id');
                    await SecureStore.deleteItemAsync('rol');
                    router.replace('/'); 
                }
            }
        ]);
    };

    if (!fontsLoaded) return null;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.accent,
                tabBarInactiveTintColor: COLORS.textSec,
                headerShown: false,
                
                // ESTILO PROFESIONAL DE LA BARRA
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 75, // Un poco más alta para mayor comodidad
                    paddingBottom: 15,
                    paddingTop: 10,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                },
                
                // TIPOGRAFÍA APLICADA A LOS LABELS
                tabBarLabelStyle: {
                    fontFamily: 'Poppins-Medium', // Fuente corporativa
                    fontSize: 11,
                    marginTop: 2,
                },
                
                // Estilo para los iconos
                tabBarIconStyle: {
                    marginBottom: -2,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profileScreen"
                options={{
                    title: 'Mi Perfil',
                    tabBarLabel: 'Perfil',
                    href: empresaState ? null : undefined, 
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="companyScreen"
                options={{
                    title: 'Mi Empresa',
                    tabBarLabel: 'Empresa',
                    href: !empresaState ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "business" : "business-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="qrScreen"
                options={{
                    title: 'Escáner QR',
                    tabBarLabel: 'QR',
                    href: !empresaState ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="admin"
                options={{
                    title: 'Panel Admin',
                    tabBarLabel: 'Admin',
                    href: !adminState ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "shield-checkmark" : "shield-checkmark-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="close"
                options={{
                    title: 'Salir',
                    tabBarLabel: 'Salir',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
                    ),
                    // Etiqueta en rojo para resaltar acción destructiva
                    tabBarLabelStyle: {
                        color: '#ff4d4d',
                        fontFamily: 'Poppins-Bold',
                        fontSize: 11,
                    }
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        handleLogout();
                    },
                })}
            />
        </Tabs>
    );
}