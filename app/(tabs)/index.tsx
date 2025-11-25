import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const safeareaInsets = useSafeAreaInsets();
  const fondo = require('../../assets/images/wave.png');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function navigateToRegister() {
    router.push('/(tabs)/account/register');
  }

  function Test() {
    console.log("Test function called");
    console.log("Email:", email);
    console.log("Password:", password);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cliente/login`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    } ).then( response => response.json() ).then( data => {
      if(data.code === 200) {
        Alert.alert("Login Successful", `Welcome back, ${data.cliente}!` );
        console.log("Cliente Data:", data);
      } else {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      }
    } 
  )
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
        >
        </TextInput>
        
        <TextInput
          placeholder="Contraseña"
          style={styles.TextInput}
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={true} 
        >
        </TextInput>
        
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.textRegister}>¿Aún no tienes cuenta? Registrate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={Test} style={styles.button}>
          <Text style={styles.textButton}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      <ImageBackground source={fondo} style={styles.background} resizeMode="cover">
      </ImageBackground>
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