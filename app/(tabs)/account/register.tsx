import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Iconos para el botón de regresar
import { Ionicons } from '@expo/vector-icons';

// Importaciones de Firebase Auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../src/firebaseConfig.js';

// PALETA DE COLORES QRONNOS
const COLORS = {
  background: '#1a1e29', 
  cardBg: '#132d46',     
  accent: '#01c38e',     
  text: '#ffffff',       
  textSec: '#b0b3b8',    
  border: '#2a3b55'      
};

// Componente Footer para QRONNOS
const QronnosFooter = () => (
    <View style={styles.footerContainer}>
        <Text style={styles.footerText}>QRONNOS</Text>
    </View>
);

export default function Register() {
    const safeareaInsets = useSafeAreaInsets();
    const router = useRouter();

    const [nombreCompleto, setNombreComplepto] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState(""); 

    async function handleRegister() {
        console.log("Register function called");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;
            const firebase_uid = user.uid; 

            await sendEmailVerification(user);

            console.log("Usuario de Firebase creado con UID:", firebase_uid);

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

            if (response.status !== 201) {
                Alert.alert(`Error ${response.status}`, `El perfil no se creó en la base de datos: ${data.message}`);
                return;
            } else {
                console.log("Respuesta del servidor:", data);
                Alert.alert(
                    "Registro Exitoso", 
                    "¡Te has registrado! Revisa tu correo para verificar tu cuenta antes de iniciar sesión."
                );
                router.replace('../../index'); 
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
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* Cabecera con Botón Regresar */}
            <View style={{ paddingTop: safeareaInsets.top + 20, paddingHorizontal: 25 }}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.accent} />
                </TouchableOpacity>
            </View>

            <View style={styles.containerLogin}>
                <Text style={styles.Titulo}>CREAR <Text style={{color: COLORS.accent}}>CUENTA</Text></Text>
                <Text style={styles.Subtitulo}>Únete al ecosistema tecnológico QRONNOS</Text>
                
                {/* Nombre Completo */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>NOMBRE COMPLETO</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="Tu nombre y apellido"
                            placeholderTextColor={COLORS.textSec}
                            style={styles.TextInput}
                            value={nombreCompleto}
                            onChangeText={setNombreComplepto}
                        />
                    </View>
                </View>
                
                {/* Correo */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                    <View style={styles.inputShadowContainer}>
                        <TextInput
                            placeholder="ejemplo@qronnos.com"
                            placeholderTextColor={COLORS.textSec}
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
                            placeholderTextColor={COLORS.textSec}
                            secureTextEntry={true}
                            style={styles.TextInput}
                            value={contrasena}
                            onChangeText={setContrasena}
                        />
                    </View>
                </View>
                
                <TouchableOpacity onPress={handleRegister} style={styles.button}>
                    <Text style={styles.textButton}>REGISTRARSE</Text>
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
        borderRadius: 12,
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    containerLogin: {
        marginTop: 20, 
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
        marginBottom: 35,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    label: {
        color: COLORS.accent,
        fontSize: 11,
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
    button: {
        backgroundColor: COLORS.accent,
        width: "100%",
        height: 60,
        marginTop: 30,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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