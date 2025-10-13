import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

// Tipado opcional: ajustá según tu shape real
type UserData = Record<string, any> | null;

type SidcaContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
};

// Context con valor por defecto seguro
export const SidcaContext = React.createContext<SidcaContextType>({
  userData: null,
  setUserData: () => {},
});

export default function RootLayout() {
  const [userData, setUserData] = React.useState<UserData>(null);

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <SidcaContext.Provider value={{ userData, setUserData }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SidcaContext.Provider>
    </SafeAreaProvider>
  );
}
