import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import React, { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { registerPushTokenForUser } from "../services/pushNotifications";
import {
  handlePushNotificationResponse,
  PushNewsModalData,
  processPendingPushNotification,
} from "../services/pushNotificationNavigation";

SplashScreen.preventAutoHideAsync();

// Tipado opcional: ajustá según tu shape real
type UserData = Record<string, any> | null;

type SidcaContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  pushNewsModal: PushNewsModalData | null;
  setPushNewsModal: React.Dispatch<
    React.SetStateAction<PushNewsModalData | null>
  >;
};

// Context con valor por defecto seguro
export const SidcaContext = React.createContext<SidcaContextType>({
  userData: null,
  setUserData: () => {},
  pushNewsModal: null,
  setPushNewsModal: () => {},
});

export default function RootLayout() {
  const [userData, setUserData] = React.useState<UserData>(null);
  const [pushNewsModal, setPushNewsModal] =
    React.useState<PushNewsModalData | null>(null);
  const pushRegistrationAttemptedFor = useRef<string | null>(null);
  const userDataRef = useRef<UserData>(null);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {});
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void handlePushNotificationResponse(
          response,
          {
            hasAuthenticatedUser: Boolean(userDataRef.current),
            isHome: pathnameRef.current === "/home",
            setPushNewsModal,
          },
        );
      });

    let mounted = true;
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!mounted || !response) return;
      void handlePushNotificationResponse(response, {
        hasAuthenticatedUser: Boolean(userDataRef.current),
        isHome: pathnameRef.current === "/home",
        setPushNewsModal,
      });
    });

    return () => {
      mounted = false;
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    userDataRef.current = userData;
    processPendingPushNotification({
      hasAuthenticatedUser: Boolean(userData),
      isHome: pathnameRef.current === "/home",
      setPushNewsModal,
    });
  }, [userData]);

  useEffect(() => {
    const usuarioId = String(
      userData?.usuarioId || userData?._docId || "",
    ).trim();
    if (!usuarioId || pushRegistrationAttemptedFor.current === usuarioId) return;

    pushRegistrationAttemptedFor.current = usuarioId;
    void registerPushTokenForUser(usuarioId);
  }, [userData?.usuarioId, userData?._docId]);

  return (
    <SafeAreaProvider>
      <SidcaContext.Provider
        value={{
          userData,
          setUserData,
          pushNewsModal,
          setPushNewsModal,
        }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SidcaContext.Provider>
    </SafeAreaProvider>
  );
}
