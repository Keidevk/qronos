import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Importaciones de Firebase Auth
import { reload, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebaseConfig';

// Define las URLs de tus APIs
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_EMPRESA_URL = `${API_URL}/api/empresa/login`;
const LOGIN_CLIENTE_URL = `${API_URL}/api/cliente/login`;

// Componente Footer para QRONNOS
const QronnosFooter = () => (
    <View style={styles.footerContainer}>
        <Text style={styles.footerText}>QRONNOS</Text>
    </View>
);

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
                const empresaId = await SecureStore.getItemAsync('empresa_id'); 

                if (userId || empresaId) {
                    console.log(`Sesión encontrada. Redirigiendo...`);
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

    async function handleLogin() {
        console.log("Login function called");
        console.log("Email:", email);
        console.log("Password:", password)
        
        try {
            // 1. AUTENTICACIÓN FIREBASE
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await reload(user); 
            
            if (!user.emailVerified) {
                Alert.alert("Verificación Requerida", "Tu correo aún no está verificado.");
                return;
            }

            // 2. LLAMADA AL BACKEND
            const response = await fetch(LOGIN_CLIENTE_URL,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
    
            const data = await response.json();
            if(response.ok && data.code === 200) {
                Alert.alert("Inicio de Sesión Exitoso", `Bienvenido/a de vuelta, ${data.cliente || data.empresa}!` );
                
                const nombreCliente = data.cliente
                const nombreEmpresa = data.empresa
                const userId = data.token; 
                const empresaId = data.token_empresa;
                const jwt = data.jwt;
                const rol = data.rol;

                if (jwt) await SecureStore.setItemAsync('jwt', String(jwt));

                if(rol) await SecureStore.setItemAsync('rol', String(rol));

                if (userId) {
                    await SecureStore.setItemAsync('user_id', String(userId));
                    await SecureStore.setItemAsync('nameCliente',String(nombreCliente))
                }

                if(empresaId){
                    await SecureStore.setItemAsync('empresa_id',String(empresaId))
                    await SecureStore.setItemAsync('nameEmpresa',String(nombreEmpresa))
                }

                router.replace('/(tabs)/dashboard'); 
            
            } else {
                Alert.alert("Error de Datos", data.message || "Credenciales válidas, pero datos del perfil incompletos.");
            }

        } catch (error: any) {
            console.error("Error en el login:", error);
            let errorMessage = "Ocurrió un error al intentar iniciar sesión.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = "Correo o contraseña incorrecta.";
            } 
            Alert.alert("Error de Inicio de Sesión", errorMessage);
        }
    }

    return (
        <View style={styles.fullContainer}>
           <View style={{ paddingTop: safeareaInsets.top, ...styles.containerLogin }}>
                
                <Text style={styles.Titulo}>Inicia Sesión</Text>
                
                {/* Caja de Email con Sombra */}
                <View style={styles.inputShadowContainer}>
                    <TextInput
                        placeholder="Correo Electrónico"
                        placeholderTextColor="#7D7D7D" 
                        style={styles.TextInput}
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address" 
                        autoCapitalize="none"
                    /> 
                </View>
                
                {/* Caja de Password con Sombra */}
                <View style={styles.inputShadowContainer}>
                    <TextInput
                        placeholder="Contraseña"
                        placeholderTextColor="#7D7D7D" 
                        style={styles.TextInput}
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={true} 
                    /> 
                </View>
                
                <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={styles.textRegister}>¿Aún no tienes cuenta? <Text style={{fontWeight: 'bold', color: '#000b76'}}>Regístrate</Text></Text>
                </TouchableOpacity>
                
                {/* Botón con Sombra Levantada */}
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.textButton}>INGRESAR</Text>
                </TouchableOpacity>

           </View>
           
           <ImageBackground source={fondo} style={styles.background} resizeMode="cover" />
           
           {/* Cartel QRONNOS */}
           <QronnosFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
    },
    Titulo: {
        fontSize: 32,
        fontWeight: '800', 
        color: '#000b76', 
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 0.5,
    },
    containerLogin: {
        marginTop: "35%", 
        paddingHorizontal: 30, 
    },
    
    // ESTILO DE SOMBRA LEVANTADA PARA INPUTS
    inputShadowContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 20,
        width: "100%",
        height: 55,
        justifyContent: 'center',
        
        // Sombra iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        
        // Sombra Android (Elevation)
        elevation: 8, 
    },
    TextInput: {
        flex: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#333333',
        borderRadius: 15, 
    },

    textRegister: {
        marginTop: 10,
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },

    // ESTILO DE BOTÓN CON SOMBRA LEVANTADA
    button: {
        backgroundColor: "#000b76",
        width: "100%", 
        height: 60, 
        marginTop: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40, // Espacio antes de llegar al borde inferior/footer

        // Sombra iOS
        shadowColor: "#000b76", 
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,

        // Sombra Android
        elevation: 10,
    },
    textButton: {
        textAlign: "center",
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    background: {
        backgroundColor: '#ffffff',
        flex: 1,
        zIndex: -1,
        position: 'absolute',
        top: "60%", // Ajustado para el footer
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    
    // 🔥 ESTILOS PARA EL CARTEL QRONNOS (Efecto Neón)
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70, // Altura del cartel
        backgroundColor: '#000b76', // Fondo azul oscuro
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 35,
        fontWeight: '900',
        color: '#FFFFFF', // Texto en blanco brillante
        letterSpacing: 8,
        textShadowColor: 'rgba(45, 156, 219, 0.9)', // Sombra azul brillante para el efecto neón
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10, 
    }
});