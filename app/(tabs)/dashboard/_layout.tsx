import { useFocusEffect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';




export default function TabLayout() {
    const [empresaState,setEmpresaState] = useState(false)

    useFocusEffect(
        useCallback(() => {
            async function getEmpresa(){
                const empresa_id = await SecureStore.getItemAsync('empresa_id')
                if(empresa_id){
                    setEmpresaState(true)
                    console.log('ES EMPRESA')
                }else{
                    setEmpresaState(false)
                    console.log('ES CLIENTE')
                }
            }
        getEmpresa()


    
    
          return () => {
            getEmpresa()
          };
        }, [])
      );
    
    // useEffect(()=>{
    //     async function getEmpresa(){
    //         const empresa_id = await SecureStore.getItemAsync('empresa_id')
    //         if(empresa_id){
    //             setEmpresaState(true)
    //         }else{
    //             setEmpresaState(false)
    //         }
    //     }
    //     getEmpresa()
    // },[])

  return (
    <>
        {empresaState ? 
        <Drawer>
            <Drawer.Screen
            name="index"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Inicio',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="companyScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Empresa',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="qrScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'QR Scanner',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="profileScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Perfil',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name='close'
            options={{
                headerShown: false,
                drawerLabelStyle:{color:'#f3f2f2ff',borderRadius:10,backgroundColor:'#e52222ff',paddingVertical:10,textAlign:'center'},
                drawerLabel:'Cerrar Sesión',
                title:'overview',
                
            }}
            >
            </Drawer.Screen>
        </Drawer>:
        <Drawer>
            <Drawer.Screen
            name="index"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Inicio',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="companyScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Empresa',
                drawerItemStyle:{display:'none'},
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="qrScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'QR Scanner',
                drawerItemStyle:{display:'none'},
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name="profileScreen"
            options={{
                drawerActiveBackgroundColor:"#f3f2f2ff",
                drawerActiveTintColor:"#1c1c1c",
                headerShown: false,
                drawerLabel: 'Perfil',
                title: 'overview',
            }}
            ></Drawer.Screen>
            <Drawer.Screen
            name='close'
            options={{
                headerShown: false,
                drawerLabelStyle:{color:'#f3f2f2ff',borderRadius:10,backgroundColor:'#e52222ff',paddingVertical:10,textAlign:'center'},
                drawerLabel:'Cerrar Sesión',
                title:'overview',
                
            }}
            >
            </Drawer.Screen>
            
        </Drawer>}
    </>
  );
}
