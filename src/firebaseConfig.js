import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfnKQBm_7K9Fgg_BVOTJ6o6z0CbBKTD30",
  authDomain: "qronnosapp.firebaseapp.com",
  projectId: "qronnosapp",
  storageBucket: "qronnosapp.firebasestorage.app",
  messagingSenderId: "539046395068",
  appId: "1:539046395068:web:af6c832e23bf4ee16164b9",
  measurementId: "G-2QRVZM7KBX"
};

const app = initializeApp(firebaseConfig);

// Mantén esto para que el login no se cierre al salir de la app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});