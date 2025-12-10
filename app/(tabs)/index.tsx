import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Importaciones de Firebase Auth (Añadidas, necesarias para el login completo)
import { reload, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebaseConfig'; // 🚨 AJUSTA LA RUTA SI ES NECESARIO

// Define las URLs de tus APIs (Añadidas, necesarias para el login completo)
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_EMPRESA_URL = `${API_URL}/api/empresa/login`;
const LOGIN_CLIENTE_URL = `${API_URL}/api/cliente/login`;


export default function HomeScreen() {
    const safeareaInsets = useSafeAreaInsets();
    const fondo = require('../../assets/images/wave.png');
    const router = useRouter() 
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        async function checkUserIdAndRedirect() {
            try {
                // 1. Buscar el valor 'user_id' o 'empresa_id' en el SecureStore
                const userId = await SecureStore.getItemAsync('user_id');
                const empresaId = await SecureStore.getItemAsync('empresa_id'); // Verificar si ya hay sesión de empresa

                // 2. Verificar si el valor existe
                if (userId || empresaId) {
                    console.log(`Sesión encontrada. Redirigiendo...`);
                    
                    // 3. Redirigir a la pestaña de dashboard
                    router.replace('/(tabs)/dashboard');
                } else {
                    console.log('User ID no encontrado. Permaneciendo en la pantalla.');
                }
            } catch (error) {
                console.error('Error al acceder a SecureStore o al navegar:', error);
            }
        }
        checkUserIdAndRedirect();
    }, []);

    function navigateToRegister() {
        router.push('/(tabs)/account/register');
    }

    // Renombramos 'Test' a 'handleLogin' por claridad
    async function handleLogin() {
        console.log("Login function called");
        console.log("Email:", email);
        
        try {
            // 1. AUTENTICACIÓN FIREBASE
            // Esto asegura que el correo y la contraseña son correctos antes de ir al backend
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await reload(user); // Recargar datos para verificar estado (como emailVerified)
            
            if (!user.emailVerified) {
                Alert.alert(
                    "Verificación Requerida", 
                    "Tu correo aún no está verificado. Por favor, revisa tu bandeja de entrada."
                );
                return;
            }

            // 2. LLAMADA AL BACKEND (Intento de cliente por simplicidad, aunque se recomienda el dual)
            // Usaremos la ruta de cliente y la estructura de guardado de la versión anterior
            const response = await fetch(LOGIN_CLIENTE_URL,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Enviamos email y password, aunque solo el email suele ser necesario si la validación es solo en backend
                    email: email, 
                    password: password,
                }),
            });
    
            const data = await response.json();

            if(data.code === 200) {
                Alert.alert("Inicio de Sesión Exitoso", `Bienvenido/a de vuelta, ${data.cliente || data.empresa}!` );
                
                // 3. Lógica de SecureStore (incluyendo 'jwt' y dualidad Cliente/Empresa)
                const nombreCliente = data.cliente
                const nombreEmpresa = data.empresa
                const userId = data.token; 
                const empresaId = data.token_empresa;
                const jwt = data.jwt; // 👈 CLAVE: Si tu API lo devuelve, lo guardamos.

                if (jwt) {
                    await SecureStore.setItemAsync('jwt', String(jwt));
                    console.log("JWT guardado en SecureStore:", jwt); 
                }

                if (userId) {
                    await SecureStore.setItemAsync('user_id', String(userId));
                    await SecureStore.setItemAsync('nameCliente',String(nombreCliente))
                    console.log("UserID guardado:", userId);
                } else {
                    console.warn("Advertencia: No se encontró 'data.token' para Cliente.");
                }

                if(empresaId){
                    await SecureStore.setItemAsync('empresa_id',String(empresaId))
                    await SecureStore.setItemAsync('nameEmpresa',String(nombreEmpresa))
                    console.log('EmpresaId guardado:', empresaId)
                }else{
                   console.warn("Advertencia: No se encontró 'data.token_empresa' para Empresa.")
                }

                router.replace('/(tabs)/dashboard'); 
            
            } else {
                // Si Firebase Auth fue exitoso, pero tu API de backend falla (ej. datos faltantes en DB)
                Alert.alert("Error de Datos", data.message || "Credenciales válidas, pero datos del perfil incompletos. Contacta a soporte.");
            }

        } catch (error: any) {
            console.error("Error en el login (Firebase o Conexión):", error);
            
            let errorMessage = "Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = "Correo o contraseña incorrecta, intente de nuevo.";
            } 
            
            Alert.alert("Error de Inicio de Sesión", errorMessage);
        }
    }

    return (
        <View style={{ backgroundColor: '#ffffff', }}>
           <View style={{ paddingTop: safeareaInsets.top, ...styles.containerLogin }}>
                <Text style={styles.Titulo}>Inicia Sesión</Text>
                
                <TextInput
                    placeholder="Correo Electrónico"
                    style={styles.TextInput}
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" 
                    autoCapitalize="none"
                /> 
                
                <TextInput
                    placeholder="Contraseña"
                    style={styles.TextInput}
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry={true} 
                /> 
                
                <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={styles.textRegister}>¿Aún no tienes cuenta? Registrate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.textButton}>Iniciar Sesión</Text>
                </TouchableOpacity>
           </View>
           
           <ImageBackground source={fondo} style={styles.background} resizeMode="cover" />
        </View>
    );
}

const styles = StyleSheet.create({
    textRegister: {
        marginTop: 5,
        marginLeft: "35%",
        textDecorationStyle: 'solid',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: "#000b76",
        width: "50%",
        height: "20%",
        marginLeft: "25%",
        marginTop: 30,
        paddingTop: '4.5%',
        borderRadius: 15,
    },
    textButton: {
        textAlign: "center",
        color: "#ffffff",
    },
    containerLogin: {
        marginTop: "50%",
    },
    background: {
        backgroundColor: '#ffffff',
        flex: 1,
        zIndex: -1,
        position: 'absolute',
        top: "55%",
        width: '100%',
        height: '100%',
    },
    Titulo: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: "27%",
    },
    TextInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 20,
        width: "80%",
        marginLeft: "10%",
        paddingLeft: 15,
        borderRadius: 15,
    }
});