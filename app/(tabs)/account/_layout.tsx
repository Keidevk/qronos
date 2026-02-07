import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="register"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="forgotpassword"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}
