import { Tabs, useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export default function TabLayout() {
    const router = useRouter();
    const [empresaState, setEmpresaState] = useState(false);
    const [adminState, setAdminState] = useState(false);

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

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sí, salir", 
                style: "destructive",
                onPress: async () => {
                    await SecureStore.deleteItemAsync('empresa_id');
                    await SecureStore.deleteItemAsync('rol');
                    // Redirigir a login o reiniciar estado
                    router.replace('/'); 
                }
            }
        ]);
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#000b76",
                tabBarInactiveTintColor: "#8e8e93",
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 5,
                    borderTopWidth: 1,
                    elevation: 0, // Quita sombra en Android
                    shadowOpacity: 0, // Quita sombra en iOS
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
                headerTitleStyle: { color: '#000b76' }
            }}
        >
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
                    href: empresaState ? null : '/dashboard/profileScreen', // Oculta si hay empresa
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="companyScreen"
                options={{
                    title: 'Mi Empresa',
                    tabBarLabel: 'Empresa',
                    href: !empresaState ? null : '/dashboard/companyScreen', // Solo si hay empresa
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
                    href: !empresaState ? null : '/dashboard/qrScreen',
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
                    href: !adminState ? null : '/dashboard/admin',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "shield-checkmark" : "shield-checkmark-outline"} size={24} color={color} />
                    ),
                }}
            />

            {/* --- BOTÓN DE LOGOUT (Acción Directa) --- */}
            <Tabs.Screen
                name="close" // Nombre ficticio
                options={{
                    title: 'Salir',
                    tabBarLabel: 'Salir',
                    href: '/(tabs)/dashboard/close',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="log-out-outline" size={24} color="#e52222ff" />
                    ),
                }}
            />
        </Tabs>
    );
}