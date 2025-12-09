// 🚨 Importación agregada: initializeApp desde 'firebase/app'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';


const firebaseConfig = {
  // 🛑 TODOS LOS VALORES DEBEN ESTAR AQUÍ Y ENTRE COMILLAS
  apiKey: "AIzaSyCs2VRuwhNYJPG2T0M5eH0KrrK-5aorn4U", 
  authDomain: "qronnos-a87f9.firebaseapp.com",
  projectId: "qronnos-a87f9",
  storageBucket: "qronnos-a87f9.firebasestorage.app", 
  messagingSenderId: "674321043468",
  appId: "1:674321043468:web:7536b6251207e093685e29",
};

const app = initializeApp(firebaseConfig); 
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});