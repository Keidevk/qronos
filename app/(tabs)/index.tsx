import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Importaciones de Firebase Auth
import { reload, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebaseConfig'; // 🚨 AJUSTA LA RUTA SI ES NECESARIO

// Define las URLs de tus APIs
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
                const userId = await SecureStore.getItemAsync('user_id');
                if (userId) {
                    console.log(`User ID encontrado: ${userId}. Redirigiendo...`);
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

    // --- NUEVA FUNCIÓN QUE MANEJA LA LLAMADA AL BACKEND ---
    async function attemptBackendLogin(email: string, password: string) {
        // Objeto a enviar en el body (solo necesitamos el email para buscar el perfil en el backend)
        const loginBody = JSON.stringify({ email: email, password: password });

        // 1. 🥇 INTENTAR LOGIN COMO EMPRESA
        let response = await fetch(LOGIN_EMPRESA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: loginBody,
        });
        let data = await response.json();

        if (response.status === 200) {
            // Éxito como Empresa
            return { type: 'empresa', data };
        } 
        
        // Si no es 200, y el error NO es un fallo de conexión/servidor (500), 
        // asumimos que el perfil no existe en la tabla de Empresas (404/Error de Datos).
        if (response.status === 404 || data.message.includes("no encontrado")) {
            console.log("No es Empresa. Intentando como Cliente...");

            // 2. 🥈 INTENTAR LOGIN COMO CLIENTE
            response = await fetch(LOGIN_CLIENTE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: loginBody,
            });
            data = await response.json();

            if (response.status === 200) {
                // Éxito como Cliente
                return { type: 'cliente', data };
            }
        }
        
        // Si fallan ambos intentos, o si hay un error 500
        return { type: 'fail', data, statusCode: response.status };
    }
    // ----------------------------------------------------
    
    async function handleLogin() {
        try {
            // 1. INICIAR SESIÓN CON FIREBASE AUTH
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. FORZAR LA RECARGA y VERIFICAR EL ESTADO
            await reload(user);

            if (!user.emailVerified) {
                Alert.alert(
                    "Verificación Requerida", 
                    "Tu correo aún no está verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace."
                );
                return;
            }
            
            // 3. LLAMAR AL BACKEND CON LA LÓGICA DUAL
            const backendResult = await attemptBackendLogin(email, password);
            const data = backendResult.data;

            if (backendResult.type !== 'fail' && data.code === 200) {
                // 4. Éxito: Guardar Tokens/IDs
                const isEmpresa = backendResult.type === 'empresa';
                
                const nameKey = isEmpresa ? 'nameEmpresa' : 'nameCliente';
                const idKey = isEmpresa ? 'empresa_id' : 'user_id';
                const tokenKey = isEmpresa ? 'token_empresa' : 'token';
                const nameValue = isEmpresa ? data.empresa : data.cliente;
                const idValue = data[tokenKey]; // Usa la clave dinámica

                Alert.alert("Inicio de Sesión Exitoso", `Bienvenido/a de vuelta, ${nameValue}!` );
                
                // Guardar los datos del perfil (Empresa o Cliente)
                if (idValue) {
                    await SecureStore.setItemAsync(idKey, String(idValue));
                    await SecureStore.setItemAsync(nameKey, String(nameValue));
                }
                
                // Si la respuesta incluye datos de ambos (login de cliente lo hacía)
                if (data.token && !isEmpresa) { 
                    await SecureStore.setItemAsync('user_id', String(data.token));
                    await SecureStore.setItemAsync('nameCliente',String(data.cliente));
                }

                router.replace('/(tabs)/dashboard'); 
            
            } else {
                // Fallo del Backend (404/500, o perfil no encontrado en ninguna tabla)
                const msg = data.message || "Error de red o perfil no encontrado en ambas bases de datos.";
                Alert.alert("Error de Datos", `Error al obtener perfil: ${msg}`);
            }

        } catch (error) {
            console.error("Error en el login (Firebase o Conexión):", error);
            // Manejar errores de Firebase
            let errorMessage = "Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = "Correo o contraseña incorrecta, intente de nuevo.";
            } 
            Alert.alert("Error de Inicio de Sesión", errorMessage);
        }
    }

    return (
        // El JSX se mantiene igual
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
                    <Text style={styles.textRegister}>¿Aún no tienes cuenta? Regístrate</Text>
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