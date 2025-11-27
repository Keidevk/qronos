import { Drawer } from 'expo-router/drawer';
import React from 'react';



export default function TabLayout() {

  return (
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
        name="profileScreen"
        options={{
            drawerActiveBackgroundColor:"#f3f2f2ff",
            drawerActiveTintColor:"#1c1c1c",
            headerShown: false,
            drawerLabel: 'Perfil',
            title: 'overview',
        }}
        ></Drawer.Screen>
    </Drawer>
  );
}
