import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  arrayUnion,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firebaseconn } from "../constants/FirebaseConn";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = "sidca";

function getExpoProjectId(): string | null {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  const normalized = String(projectId || "").trim();
  return normalized || null;
}

/** Obtiene el token Expo sin bloquear el flujo principal de la aplicación. */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "SIDCA",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    let status = currentPermissions.status;
    if (status !== "granted") {
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      status = requestedPermissions.status;
    }
    if (status !== "granted") {
      return null;
    }

    const projectId = getExpoProjectId();
    if (!projectId) {
      return null;
    }

    let token;
    try {
      token = await Notifications.getExpoPushTokenAsync({ projectId });
    } catch (error) {
      throw error;
    }
    const tokenValue = String(token.data || "").trim();
    return tokenValue || null;
  } catch (error) {
    return null;
  }
}

/** Registra el token en el usuario ya identificado, sin crear usuarios nuevos. */
export async function registerPushTokenForUser(
  usuarioId: string,
): Promise<string | null> {
  const normalizedUsuarioId = String(usuarioId || "").trim();
  if (!normalizedUsuarioId) {
    return null;
  }

  const token = await registerForPushNotificationsAsync();
  if (!token) return null;

  try {
    const db = getFirestore(firebaseconn);
    await updateDoc(doc(db, "usuarios", normalizedUsuarioId), {
      pushTokens: arrayUnion(token),
      pushActualizadoAt: serverTimestamp(),
    });
    return token;
  } catch (error) {
    return null;
  }
}
