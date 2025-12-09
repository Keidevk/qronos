import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Importaciones de Firebase Auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../src/firebaseConfig.js'; // 🚨 AJUSTA LA RUTA SI ES NECESARIO

export default function Register() {
    const safeareaInsets = useSafeAreaInsets();
    const fondo = require('../../../assets/images/wave.png');
    const router = useRouter();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState(""); // Necesaria solo para Firebase

    async function handleRegister() {
        console.log("Register function called");

        try {
            // 1. CREAR EL USUARIO EN FIREBASE AUTH
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;
            const firebase_uid = user.uid; // Obtener el UID

            // 2. ENVIAR EL CORREO DE VERIFICACIÓN
            await sendEmailVerification(user);

            console.log("Usuario de Firebase creado con UID:", firebase_uid);
            
            // En register.tsx, dentro de handleRegister()

            // ... asumiendo que tienes variables nombreCompleto, correo, contrasena
            // ... y obtuviste firebase_uid de userCredential.user.uid

            // 3. LLAMADA A TU BACKEND
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cliente/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreCompleto: nombreCompleto,
                    correo: correo,
                    // 🔥 ESTO ES CRÍTICO: Debe ser 'contrasena' y NO 'password'
                    contrasena: contrasena, 
                    auth_uid: firebase_uid 
    })
});
// ...
            const data = await response.json();

            // 4. VERIFICACIÓN DEL BACKEND
            if (response.status !== 201) {
                // Si el backend falla, alertamos. Podrías eliminar el usuario de Firebase
                // en este punto para evitar cuentas huérfanas: await user.delete();
                Alert.alert(`Error ${response.status}`, `El perfil no se creó en la base de datos: ${data.message}`);
                return;
            } else {
                console.log("Respuesta del servidor:", data);
                Alert.alert(
                    "Registro Exitoso", 
                    "¡Te has registrado! Revisa tu correo para **verificar tu cuenta** antes de iniciar sesión."
                );
                router.replace('/(tabs)/account/login'); 
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            // Manejo de errores de Firebase
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
        // ... (El resto del código JSX y Styles se mantiene igual)
        <View style={styles.fullScreenContainer}>
            <View style={{ paddingTop: safeareaInsets.top, ...styles.containerLogin }}>
                <Text style={styles.Titulo}>Registro</Text>
                
                <TextInput
                    placeholder="Nombre Completo"
                    style={styles.TextInput}
                    value={nombreCompleto}
                    onChangeText={setNombreCompleto}
                />
                
                <TextInput
                    placeholder="Correo Electrónico"
                    style={styles.TextInput}
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    placeholder="Contraseña"
                    secureTextEntry={true}
                    style={styles.TextInput}
                    value={contrasena}
                    onChangeText={setContrasena}
                />
                
                <TouchableOpacity onPress={handleRegister} style={styles.button}>
                    <Text style={styles.textButton}>Registrarse</Text>
                </TouchableOpacity>
            </View>
            <ImageBackground source={fondo} style={styles.background} resizeMode="cover" />
        </View>
    );
}

// ... (Styles se mantienen iguales)

const styles = StyleSheet.create({
    fullScreenContainer: {
        backgroundColor: '#ffffff',
    },
    clientTypeContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '80%',
        marginLeft: '10%',
        marginTop: 20,
        height: 50,
    },
    selectionButtonContainer: {
        width: '45%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
    },
    selectionButtonText: {
        fontSize: 16,
        color: '#333',
    },
    selected: {
        borderColor: 'blue',
        backgroundColor: '#eee',
    },
    selectedText: {
        fontWeight: 'bold',
        color: 'blue',
    },

    
    containerLogin: {
        marginTop: "20%",
    },

    background: {
        backgroundColor: '#ffffff',
        zIndex: -1,
        position: 'absolute',
        top: '80%', 
        width: '100%',
        height: '100%',
    },

    Titulo: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: "35%",
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
    },
    button: {
        backgroundColor: "#000b76",
        width: "50%",
        height: "15%", 
        marginLeft: "25%",
        marginTop: 30,
        paddingTop: '4.5%',
        borderRadius: 15,
    },
    
    textButton: {
        textAlign: "center",
        color: "#ffffff",
    },
});