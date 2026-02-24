import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="account"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="guest"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}
