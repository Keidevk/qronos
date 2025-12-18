import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Iconos para el botón de regresar
import { Ionicons } from '@expo/vector-icons';

// Importaciones de Firebase Auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../src/firebaseConfig.js';

// Componente Footer para QRONNOS
const QronnosFooter = () => (
    <View style={styles.footerContainer}>
        <Text style={styles.footerText}>QRONNOS</Text>
    </View>
);

export default function Register() {
    const safeareaInsets = useSafeAreaInsets();
    const fondo = require('../../../assets/images/wave.png');
    const router = useRouter();

    const [nombreCompleto, setNombreComplepto] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState(""); 

    async function handleRegister() {
        console.log("Register function called");

        try {
            // 1. CREAR EL USUARIO EN FIREBASE AUTH
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;
            const firebase_uid = user.uid; 

            // 2. ENVIAR EL CORREO DE VERIFICACIÓN
            await sendEmailVerification(user);

            console.log("Usuario de Firebase creado con UID:", firebase_uid);

            // 3. LLAMADA A TU BACKEND
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cliente/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreCompleto: nombreCompleto,
                    correo: correo,
                    contrasena: contrasena, 
                    auth_uid: firebase_uid 
                })
            });

            const data = await response.json();

            // 4. VERIFICACIÓN DEL BACKEND
            if (response.status !== 201) {
                Alert.alert(`Error ${response.status}`, `El perfil no se creó en la base de datos: ${data.message}`);
                return;
            } else {
                console.log("Respuesta del servidor:", data);
                Alert.alert(
                    "Registro Exitoso", 
                    "¡Te has registrado! Revisa tu correo para **verificar tu cuenta** antes de iniciar sesión."
                );
                router.replace('../../index'); // Redirigir al inicio o a la pantalla de login
            }

        } catch (error: any) {
            console.error("Error en el registro:", error);
            let errorMessage = "Hubo un problema al registrarse. Intenta de nuevo.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Este correo ya está registrado.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "La contraseña debe tener al menos 6 caracteres.";
            }
            Alert.alert("Error de Registro", errorMessage);
        }
    }

    return (
        <View style={styles.fullScreenContainer}>
            
            {/* Cabecera con Botón Regresar */}
            <View style={{ paddingTop: safeareaInsets.top + 10, paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#000b76" />
                </TouchableOpacity>
            </View>

            <View style={styles.containerLogin}>
                <Text style={styles.Titulo}>Crear Cuenta</Text>
                
                {/* Nombre Completo */}
                <View style={styles.inputShadowContainer}>
                    <TextInput
                        placeholder="Nombre Completo"
                        placeholderTextColor="#7D7D7D"
                        style={styles.TextInput}
                        value={nombreCompleto}
                        onChangeText={setNombreComplepto}
                    />
                </View>
                
                {/* Correo */}
                <View style={styles.inputShadowContainer}>
                    <TextInput
                        placeholder="Correo Electrónico"
                        placeholderTextColor="#7D7D7D"
                        style={styles.TextInput}
                        value={correo}
                        onChangeText={setCorreo}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                
                {/* Contraseña */}
                <View style={styles.inputShadowContainer}>
                    <TextInput
                        placeholder="Contraseña"
                        placeholderTextColor="#7D7D7D"
                        secureTextEntry={true}
                        style={styles.TextInput}
                        value={contrasena}
                        onChangeText={setContrasena}
                    />
                </View>
                
                <TouchableOpacity onPress={handleRegister} style={styles.button}>
                    <Text style={styles.textButton}>REGISTRARSE</Text>
                </TouchableOpacity>
            </View>
            
            {/* Imagen de Fondo (Ajustada para dejar espacio) */}
            <ImageBackground source={fondo} style={styles.background} resizeMode="cover" />

            {/* Cartel QRONNOS */}
            <QronnosFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
    },
    
    // Botón de regreso
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 10,
    },

    containerLogin: {
        marginTop: "10%", 
        paddingHorizontal: 30,
        // Usamos flex: 1 en el contenedor principal, así que este ya no necesita definir altura.
    },

    Titulo: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000b76',
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 0.5,
    },

    // ESTILO DE SOMBRA
    inputShadowContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 20,
        width: "100%",
        height: 55,
        justifyContent: 'center',
        
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        
        elevation: 8, 
    },

    TextInput: {
        flex: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#333333',
        borderRadius: 15,
    },

    // BOTÓN CON SOMBRA
    button: {
        backgroundColor: "#000b76",
        width: "100%",
        height: 60,
        marginTop: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: "#000b76",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 8,

        elevation: 10,
        marginBottom: 40, // Espacio antes de llegar al borde inferior/footer
    },
    
    textButton: {
        textAlign: "center",
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    // Imagen de fondo: Ajustada para no superponer el footer
    background: {
        backgroundColor: '#ffffff',
        zIndex: -1,
        position: 'absolute',
        top: "60%", 
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },

    // 🔥 ESTILOS PARA EL CARTEL QRONNOS (Efecto Neón)
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70, // Altura del cartel
        backgroundColor: '#000b76', // Fondo azul oscuro o el mismo del botón
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