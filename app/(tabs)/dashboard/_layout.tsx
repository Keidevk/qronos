import { useFocusEffect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

export default function TabLayout() {
    const [empresaState,setEmpresaState] = useState(false)
    
    useFocusEffect(
        useCallback(() => {
            async function getEmpresa(){
                const empresa_id = await SecureStore.getItemAsync('empresa_id')
                    if(empresa_id){
                        setEmpresaState(true)
                    }else{
                        setEmpresaState(false)
                    }
            }
        getEmpresa()
        }, [])
    );

    // 1. Estilos Comunes de Navegación (Alineación a la izquierda con margen)
    const drawerCommonOptions = {
        drawerActiveBackgroundColor: "#f3f2f2ff", 
        drawerActiveTintColor: "#000b76", 
        drawerInactiveTintColor: "#333333", 
        // Margen negativo para empujar el texto hacia donde estaría el ícono
        drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 5, // Se mantiene para alineación de ítems normales
        },
        headerShown: false,
    }

    const drawerStyles = {
        drawerStyle: {
            backgroundColor: '#ffffff',
            width: 280,
        },
        drawerContentStyle: {
            backgroundColor: '#ffffff',
        },
    }
    
    // 2. Opción para Cerrar Sesión (Centrado y visible)
    const closeSessionOptions = {
        headerShown: false,
        drawerLabel: 'Cerrar Sesión',
        title: 'overview',
        // Estilo del contenedor (Botón rojo)
        drawerItemStyle: {
            marginTop: 20, 
            marginHorizontal: 15, 
            borderRadius: 15,
            backgroundColor: '#e52222ff',
            // 🔥 Quitamos estas propiedades de centrado del padre, y centramos el texto hijo.
            // justifyContent: 'center', 
            // alignItems: 'center', 
        },
        // Estilo del texto
        drawerLabelStyle: {
            // Heredamos solo el tamaño de fuente y peso
            fontSize: 16,
            fontWeight: '600',
            
            // 🔥 SOLUCIÓN: Forzamos el color y el ancho y centrado.
            color: '#ffffff', 
            width: '100%', // El texto ocupa todo el ancho del drawer item (rojo)
            textAlign: 'center', 
            marginLeft: 10, // Aseguramos no tener margen negativo
            paddingVertical: 5, // Aumentamos un poco el padding vertical para más cuerpo
            
        }
    }

    const navigationItemOptions = {
        ...drawerCommonOptions
    }


    return (
        <>
            <Drawer
                screenOptions={{
                    ...drawerStyles,
                }}
            >
                {/* -------------------- PANTALLAS BÁSICAS (Común) -------------------- */}
                <Drawer.Screen
                name="index"
                options={{
                    ...navigationItemOptions,
                    drawerLabel: 'Inicio',
                }}
                />
                
                <Drawer.Screen
                name="profileScreen"
                options={{
                    ...navigationItemOptions,
                    drawerLabel: 'Perfil',
                }}
                />

                {/* -------------------- PANTALLAS CONDICIONALES -------------------- */}
                <Drawer.Screen
                name="companyScreen"
                options={{
                    ...navigationItemOptions,
                    drawerLabel: 'Empresa',
                    drawerItemStyle: !empresaState ? { display: 'none' } : undefined,
                }}
                />

                <Drawer.Screen
                name="qrScreen"
                options={{
                    ...navigationItemOptions,
                    drawerLabel: 'QR Scanner',
                    drawerItemStyle: !empresaState ? { display: 'none' } : undefined,
                }}
                />
                
                {/* -------------------- CERRAR SESIÓN (Centrado y visible) -------------------- */}
                <Drawer.Screen
                name='close'
                options={{
                    ...closeSessionOptions,
                }}
                />
            </Drawer>
        </>
    );
}