import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QRScreen() {
    const Insents = useSafeAreaInsets()
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false); // Para evitar escanear múltiples veces el mismo código
    const [messageState,setMessageState] = useState('')
    async function CreateMetricasQr(qr_token:string,puntos:number){
      const empresa_id = await SecureStore.getItemAsync('empresa_id')
      const jwt = await SecureStore.getItemAsync('jwt')
      try{
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/metricas/register-scan`,{
          method:"POST",
          headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${jwt}`, // Usamos el JWT para autorización
                  },
          body:JSON.stringify({
            qr_token:qr_token,
            empresa_id:empresa_id,
            puntos:puntos,
          })
        })

        const data = await response.json()
        setMessageState(data.message)

      }catch(err){
      console.log(err)
    }
      
    }
    if (!permission) {
      // Los permisos aún se están cargando
      return <View />;
    }
    if (!permission.granted) {
        // Permisos denegados
        return (
          <View style={{paddingTop:Insents.top}}>
            <Text style={{ textAlign: 'center',marginTop:'50%' }}>Necesitamos permiso para acceder a la cámara.</Text>
            <TouchableOpacity onPress={requestPermission} >
              <Text style={{color:'#000b76',textAlign:'center',marginTop:10}}>Conceder permiso</Text>
            </TouchableOpacity>
          </View>
        );
    }
    const handleBarCodeScanned = ({ type, data }:{type:any,data:any}) => {
    setScanned(true);
    CreateMetricasQr(data,5)
    // alert(`Código QR escaneado:\nTipo: ${type}\nDatos: ${data}`);
  };

  return (
    <View style={{paddingTop:Insents.top}}>
      {!scanned && (
        <>
        <CameraView
        style={{ marginHorizontal:'auto',marginTop: Insents.top+50 ,height: 300,width:300,borderRadius:50 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <Text style={{ textAlign: 'center', marginTop: 20,fontWeight:600 }}>Apunta la cámara hacia un código QR</Text>
        </>
      )}
    
    

      
      {scanned && (
        <>
          <TouchableOpacity style={{backgroundColor:'#000b76',margin:'auto',padding:10,borderRadius:10,marginTop:'50%',marginBottom:10}} onPress={() => setScanned(false)} >
            <Text style={{color:'#fff'}}>Toca para escanear de nuevo</Text>
          </TouchableOpacity>
          <Text style={{margin:'auto'}}>{messageState}</Text>

        </>
        
      )}
      
    </View>
  );
}
