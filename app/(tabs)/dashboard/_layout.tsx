import { Ionicons } from '@expo/vector-icons';
import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

// PALETA DE COLORES (Extraída del Login)
const COLORS = {
    background: '#1a1e29', // Fondo Principal
    cardBg: '#132d46',     // Fondo secundario
    accent: '#01c38e',     // Neón Mint (Color activo)
    text: '#ffffff',       // Blanco
    textSec: '#b0b3b8',    // Gris (Color inactivo)
    border: '#2a3b55'      // Bordes
};

export default function TabLayout() {
    const router = useRouter();
    const [empresaState, setEmpresaState] = useState(false);
    const [adminState, setAdminState] = useState(false);

    // Verificación de credenciales (Lógica del nuevo código)
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
        Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sí, salir", 
                style: "destructive",
                onPress: async () => {
                    await SecureStore.deleteItemAsync('empresa_id');
                    await SecureStore.deleteItemAsync('rol');
                    router.replace('/'); 
                }
            }
        ]);
    };

    return (
        <Tabs
            screenOptions={{
                // COLORES DE LA BARRA
                tabBarActiveTintColor: COLORS.accent, // Verde Neón
                tabBarInactiveTintColor: COLORS.textSec, // Gris apagado
                
                // ESTILO DEL CONTENEDOR (Fondo oscuro y bordes)
                tabBarStyle: {
                    backgroundColor: COLORS.background, // Mismo fondo que el login
                    borderTopColor: COLORS.border,      // Borde sutil superior
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 5,
                    elevation: 0,       // Sin sombra en Android
                    shadowOpacity: 0,   // Sin sombra en iOS
                },
                
                // ESTILO DEL TEXTO
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                
                headerShown: false,
            }}
        >
            {/* --- PANTALLAS BÁSICAS --- */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profileScreen"
                options={{
                    title: 'Mi Perfil',
                    tabBarLabel: 'Perfil',
                    // Si hay empresa, ocultamos este tab (href: null)
                    href: empresaState ? null : undefined, 
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />

            {/* --- PANTALLAS CONDICIONALES --- */}
            <Tabs.Screen
                name="companyScreen"
                options={{
                    title: 'Mi Empresa',
                    tabBarLabel: 'Empresa',
                    // Si NO hay empresa, ocultamos este tab
                    href: !empresaState ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "business" : "business-outline"} size={24} color={color} />
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
                        <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={24} color={color} />
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
                        <Ionicons name={focused ? "shield-checkmark" : "shield-checkmark-outline"} size={24} color={color} />
                    ),
                }}
            />

            {/* --- BOTÓN DE LOGOUT (Acción Directa) --- */}
            <Tabs.Screen
                name="close"
                options={{
                    title: 'Salir',
                    tabBarLabel: 'Salir',
                    tabBarIcon: ({ color }) => (
                        // Mantenemos el rojo para indicar acción destructiva, o puedes cambiarlo a COLORS.accent si prefieres
                        <Ionicons name="log-out-outline" size={24} color="#e52222ff" />
                    ),
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        // Prevenimos la navegación a la pantalla "close" y ejecutamos la alerta
                        e.preventDefault();
                        handleLogout();
                    },
                })}
            />
        </Tabs>
    );
}