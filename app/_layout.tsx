import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import React from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export const SidcaContext=React.createContext()
export default function RootLayout() {
  const [userData,setUserData]=React.useState<any>([])

  return (
    <SidcaContext.Provider value={{userData,setUserData}}>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SidcaContext.Provider>
  );
}
