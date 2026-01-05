import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Importaciones de Firebase Auth
import { reload, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebaseConfig';

// PALETA DE COLORES QRONNOS (Igual al Dashboard)
const COLORS = {
  background: '#1a1e29', // Fondo Principal
  cardBg: '#132d46',     // Fondo de Inputs
  accent: '#01c38e',     // Neón Mint
  text: '#ffffff',       // Blanco
  textSec: '#b0b3b8',    // Gris
  border: '#2a3b55'      // Bordes
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_CLIENTE_URL = `${API_URL}/api/cliente/login`;

// Componente Footer para QRONNOS (Estilo Dark/Neon)
const QronnosFooter = () => (
    <View style={styles.footerContainer}>
        <Text style={styles.footerText}>QRONNOS</Text>
    </View>
);

export default function HomeScreen() {
    const safeareaInsets = useSafeAreaInsets();
    const router = useRouter();
    
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
        
        try {
            let expoToken = null;
            try {
                const projectId = process.env.EXPO_PUBLIC_PROJECT_ID; 
                if (projectId) {
                    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                    expoToken = tokenData.data;
                    console.log("Push Token generado:", expoToken);
                }
            } catch (e) {
                console.log("Error al obtener token de notificaciones:", e);
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await reload(user); 
            
            if (!user.emailVerified) {
                Alert.alert("Verificación Requerida", "Tu correo aún no está verificado.");
                return;
            }

            if(!expoToken){
                await SecureStore.getItemAsync('expoPushToken').then(token => {
                    expoToken = token;
                });
                console.log("Usando token almacenado:", expoToken);
            }

            const response = await fetch(LOGIN_CLIENTE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    password: password,
                    pushToken: expoToken 
                }),
            });

            const data = await response.json();
            
            if(response.ok && data.code === 200) {
                Alert.alert("Inicio de Sesión Exitoso", `Bienvenido/a de vuelta, ${data.cliente || data.empresa}!` );
                
                const nombreCliente = data.cliente;
                const nombreEmpresa = data.empresa;
                const userId = data.token; 
                const empresaId = data.token_empresa;
                const jwt = data.jwt;
                const rol = data.rol;

                if (jwt) await SecureStore.setItemAsync('jwt', String(jwt));
                if (rol) await SecureStore.setItemAsync('rol', String(rol));

                if (userId) {
                    await SecureStore.setItemAsync('user_id', String(userId));
                    await SecureStore.setItemAsync('nameCliente', String(nombreCliente));
                }

                if(empresaId){
                    await SecureStore.setItemAsync('empresa_id', String(empresaId));
                    await SecureStore.setItemAsync('nameEmpresa', String(nombreEmpresa));
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
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            <View style={{ paddingTop: safeareaInsets.top + 60, ...styles.containerLogin }}>
                
                <Text style={styles.Titulo}>INICIAR <Text style={{color: COLORS.accent}}>SESIÓN</Text></Text>
                <Text style={styles.Subtitulo}>Ingresa tus credenciales para continuar</Text>
                
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="ejemplo@qronnos.com"
                            placeholderTextColor={COLORS.textSec} 
                            style={styles.TextInput}
                            value={email} 
                            onChangeText={setEmail} 
                            keyboardType="email-address" 
                            autoCapitalize="none"
                        /> 
                    </View>
                </View>
                
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>CONTRASEÑA</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="********"
                            placeholderTextColor={COLORS.textSec} 
                            style={styles.TextInput}
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry={true} 
                        /> 
                    </View>
                </View>
                
                <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={styles.textRegister}>
                        ¿Aún no tienes cuenta? <Text style={{fontWeight: 'bold', color: COLORS.accent}}>Regístrate</Text>
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.textButton}>INGRESAR</Text>
                </TouchableOpacity>

            </View>
            
            <QronnosFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: {
        backgroundColor: COLORS.background,
        flex: 1,
    },
    containerLogin: {
        paddingHorizontal: 30, 
    },
    Titulo: {
        fontSize: 32,
        fontWeight: '900', 
        color: COLORS.text, 
        textAlign: 'center',
        letterSpacing: 1,
    },
    Subtitulo: {
        fontSize: 14,
        color: COLORS.textSec,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 40,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 5,
        letterSpacing: 1,
    },
    inputShadowContainer: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        width: "100%",
        height: 55,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    TextInput: {
        flex: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: COLORS.text,
    },
    textRegister: {
        marginTop: 10,
        textAlign: 'center',
        color: COLORS.textSec,
        fontSize: 14,
    },
    button: {
        backgroundColor: COLORS.accent,
        width: "100%", 
        height: 60, 
        marginTop: 35,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        // Efecto Glow Neon
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    textButton: {
        color: "#000",
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.accent,
        letterSpacing: 12,
        opacity: 0.8,
        textShadowColor: COLORS.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8, 
    }
});