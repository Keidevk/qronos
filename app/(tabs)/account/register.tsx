import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Importaciones de Firebase Auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../src/firebaseConfig.js';

// PALETA DE COLORES QRONNOS
const COLORS = {
    background: '#0f1115', 
    cardBg: '#181b21',     
    accent: '#01c38e',     
    text: '#ffffff',       
    textSec: '#8b9bb4',    
    border: '#232936'      
};

// CONSTANTES DE FUENTES
const FONTS = {
    title: 'Heavitas',
    textRegular: 'Poppins-Regular',
    textMedium: 'Poppins-Medium',
    textBold: 'Poppins-Bold'
};

const QronnosFooter = () => (
    <View style={styles.footerContainer}>
        <Text style={styles.footerText}>QRONNOS</Text>
    </View>
);

export default function Register() {
    const safeareaInsets = useSafeAreaInsets();
    const router = useRouter();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState(""); 
    const [isRegistering, setIsRegistering] = useState(false);

    // CARGA DE FUENTES (Rutas corregidas para la profundidad de carpeta actual)
    const [fontsLoaded] = useFonts({
        'Heavitas': require('../../../assets/fonts/Heavitas.ttf'),
        'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
    });

    async function handleRegister() {
        if (!nombreCompleto || !correo || !contrasena) {
            Alert.alert("Campos incompletos", "Por favor llena todos los datos.");
            return;
        }

        setIsRegistering(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;
            const firebase_uid = user.uid; 

            await sendEmailVerification(user);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cliente/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreCompleto: nombreCompleto,
                    correo: correo,
                    contrasena: contrasena, 
                    auth_uid: firebase_uid 
                })
            });

            const data = await response.json();

            if (response.status !== 201) {
                Alert.alert("Error de Registro", data.message || "No se pudo crear el perfil.");
            } else {
                Alert.alert(
                    "Registro Exitoso", 
                    "¡Cuenta creada! Revisa tu correo para verificar tu cuenta antes de iniciar sesión."
                );
                router.replace('/'); 
            }

        } catch (error: any) {
            let errorMessage = "Hubo un problema al registrarse.";
            if (error.code === 'auth/email-already-in-use') errorMessage = "Este correo ya está registrado.";
            else if (error.code === 'auth/weak-password') errorMessage = "La contraseña es muy débil.";
            Alert.alert("Error de Registro", errorMessage);
        } finally {
            setIsRegistering(false);
        }
    }

    if (!fontsLoaded) return null;

    return (
        <View style={styles.fullScreenContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* Cabecera con Botón Regresar */}
            <View style={{ paddingTop: safeareaInsets.top + 20, paddingHorizontal: 25 }}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
                </TouchableOpacity>
            </View>

            <View style={styles.containerLogin}>
                <Text style={styles.welcomeText}>NUEVA EXPERIENCIA</Text>
                <Text style={styles.Titulo}>CREAR <Text style={{color: COLORS.accent}}>CUENTA</Text></Text>
                <Text style={styles.Subtitulo}>Únete al ecosistema tecnológico QRONNOS</Text>
                
                {/* Nombre Completo */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>NOMBRE COMPLETO</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="Tu nombre y apellido"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            style={styles.TextInput}
                            value={nombreCompleto}
                            onChangeText={setNombreCompleto}
                        />
                    </View>
                </View>
                
                {/* Correo */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="ejemplo@qronnos.com"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            style={styles.TextInput}
                            value={correo}
                            onChangeText={setCorreo}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                </View>
                
                {/* Contraseña */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>CONTRASEÑA</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="********"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            secureTextEntry={true}
                            style={styles.TextInput}
                            value={contrasena}
                            onChangeText={setContrasena}
                        />
                    </View>
                </View>
                
                <TouchableOpacity 
                    onPress={handleRegister} 
                    style={[styles.button, isRegistering && { opacity: 0.7 }]}
                    disabled={isRegistering}
                >
                    {isRegistering ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.textButton}>REGISTRARSE</Text>
                    )}
                </TouchableOpacity>
            </View>
            
            <QronnosFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        backgroundColor: COLORS.background,
        flex: 1,
    },
    backButton: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    containerLogin: {
        marginTop: 20, 
        paddingHorizontal: 35,
    },
    welcomeText: {
        fontFamily: FONTS.textBold,
        fontSize: 12,
        color: COLORS.accent,
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: 5
    },
    Titulo: {
        fontSize: 28,
        fontFamily: FONTS.title,
        color: COLORS.text,
        textAlign: 'center',
    },
    Subtitulo: {
        fontSize: 14,
        fontFamily: FONTS.textRegular,
        color: COLORS.textSec,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 35,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        color: COLORS.text,
        fontSize: 10,
        fontFamily: FONTS.textBold,
        marginBottom: 10,
        marginLeft: 5,
        letterSpacing: 1.5,
        opacity: 0.6
    },
    inputShadowContainer: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        width: "100%",
        height: 60,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    TextInput: {
        flex: 1,
        paddingHorizontal: 20,
        fontSize: 15,
        fontFamily: FONTS.textMedium,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.accent,
        width: "100%",
        height: 60,
        marginTop: 30,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    textButton: {
        color: "#000",
        fontSize: 15,
        fontFamily: FONTS.title,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 34,
        fontFamily: FONTS.title,
        color: COLORS.accent,
        letterSpacing: 15,
        textShadowColor: COLORS.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        elevation: 10,
    }
});