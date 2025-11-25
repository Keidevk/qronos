import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function Register() {
    const safeareaInsets = useSafeAreaInsets();

    const fondo = require('../../../assets/images/wave.png');
    const router = useRouter();
    
    function handleRegister() {
        console.log("Register function called");
    }


    return (
        <View style={styles.fullScreenContainer}>
            <View style={{ paddingTop: safeareaInsets.top, ...styles.containerLogin }}>
                <Text style={styles.Titulo}>Registro</Text>
                <TextInput
                    placeholder="Nombre Completo"
                    style={styles.TextInput}
                />
                <TextInput
                    placeholder="Correo Electrónico"
                    style={styles.TextInput}
                />
                <TextInput
                    placeholder="Contraseña"
                    secureTextEntry={true}
                    style={styles.TextInput}
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