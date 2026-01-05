import { useFocusEffect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

// PALETA DE COLORES QRONNOS (Consistente con Dashboard y Login)
const COLORS = {
  background: '#1a1e29', // Fondo Principal
  cardBg: '#132d46',     // Fondo de items activos
  accent: '#01c38e',     // Neón Mint
  text: '#ffffff',       // Blanco
  textSec: '#b0b3b8',    // Gris
  border: '#2a3b55',     // Bordes
  danger: '#ff4d4d'      // Rojo para cerrar sesión
};

export default function TabLayout() {
    const [empresaState, setEmpresaState] = useState(false);
    const [adminState, setAdminState] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function getEmpresa() {
                const empresa_id = await SecureStore.getItemAsync('empresa_id');
                const admin = await SecureStore.getItemAsync('rol');
                setEmpresaState(!!empresa_id);
                setAdminState(admin === 'Admin');
            }
            getEmpresa();
        }, [])
    );

    // Estilos Comunes de Navegación (Cyberpunk Style)
    const drawerCommonOptions = {
        drawerActiveBackgroundColor: COLORS.cardBg,
        drawerActiveTintColor: COLORS.accent,
        drawerInactiveTintColor: COLORS.textSec,
        drawerLabelStyle: {
            fontFamily: 'Poppins', 
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 5,
        },
        headerShown: false,
    };

    const drawerStyles = {
        drawerStyle: {
            backgroundColor: COLORS.background, // Fondo oscuro
            width: 280,
            borderRightWidth: 1,
            borderRightColor: COLORS.border,
        },
        drawerContentStyle: {
            backgroundColor: COLORS.background,
        },
    };

    // Opción para Cerrar Sesión (Estilo Alerta)
    const closeSessionOptions = {
        headerShown: false,
        drawerLabel: 'Cerrar Sesión',
        drawerItemStyle: {
            marginTop: 40,
            marginHorizontal: 15,
            borderRadius: 12,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: COLORS.danger,
        },
        drawerLabelStyle: {
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: '600',
            color: COLORS.danger,
            width: '100%',
            textAlign: 'center',
            marginLeft: 0,
            paddingVertical: 5,
        }
    };

    return (
        <Drawer
            screenOptions={{
                ...drawerStyles,
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    ...drawerCommonOptions,
                    drawerLabel: 'Inicio',
                }}
            />
            <Drawer.Screen
                name="profileScreen"
                options={{
                    ...drawerCommonOptions,
                    drawerLabel: 'Perfil',
                    drawerItemStyle: empresaState ? { display: 'none' } : { borderRadius: 12, marginHorizontal: 10 },
                }}
            />
            <Drawer.Screen
                name="companyScreen"
                options={{
                    ...drawerCommonOptions,
                    drawerLabel: 'Empresa',
                    drawerItemStyle: !empresaState ? { display: 'none' } : { borderRadius: 12, marginHorizontal: 10 }
                }}
            />
            <Drawer.Screen
                name="qrScreen"
                options={{
                    ...drawerCommonOptions,
                    drawerLabel: 'QR Scanner',
                    drawerItemStyle: !empresaState ? { display: 'none' } : { borderRadius: 12, marginHorizontal: 10 },
                }}
            />
            <Drawer.Screen
                name='admin'
                options={{
                    ...drawerCommonOptions,
                    drawerLabel: 'Administración',
                    drawerItemStyle: !adminState ? { display: 'none' } : { borderRadius: 12, marginHorizontal: 10 }
                }}
            />
            <Drawer.Screen
                name='close'
                options={{
                    ...closeSessionOptions,
                }}
            />
        </Drawer>
    );
}