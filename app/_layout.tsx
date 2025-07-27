import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import React, { useEffect, useCallback } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export const SidcaContext = React.createContext();

export default function RootLayout() {
  const [userData, setUserData] = React.useState<any>([]);

  
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <SidcaContext.Provider value={{ userData, setUserData }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SidcaContext.Provider>
  );
}
