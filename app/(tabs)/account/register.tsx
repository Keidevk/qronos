import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Register() {
    const safeareaInsets = useSafeAreaInsets();
    const fondo = require('../../../assets/images/wave.png');
    const router = useRouter();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");

    async function handleRegister() {
        console.log("Register function called");

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cliente/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreCompleto: nombreCompleto,
                    correo: correo,
                    contrasena: contrasena
                })
            });

            const data = await response.json();
            if (data.code !== 201) {
                Alert.alert(`Error ${response.status}`, `${data.message}`);
                return;
            }else {
                console.log("Respuesta del servidor:", data);
                Alert.alert("Registro Exitoso", "¡Te has registrado correctamente!");
                router.replace('/(tabs)')
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            Alert.alert("Error de Registro", "Hubo un problema al registrarse. Por favor, inténtalo de nuevo.");
        }
    }

    return (
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