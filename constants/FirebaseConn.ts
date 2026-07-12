import { initializeApp } from "firebase/app"
import { initializeFirestore } from "firebase/firestore"

const firebaseConfig  = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE,
    authDomain: "sidca-a33f0.firebaseapp.com",
    projectId: "sidca-a33f0",
    storageBucket: "sidca-a33f0.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGE,
    appId: process.env.EXPO_PUBLIC_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_MEASUREMENT
  };
export const firebaseconn = initializeApp(
  firebaseConfig
);

// Algunas redes WiFi (proxies, firewalls, filtrado de paquetes en redes
// corporativas/educativas) cortan la conexión streaming (WebChannel) que
// Firestore usa por defecto, y en vez de tirar un error de red devuelven
// una respuesta vacía que la app interpreta como "DNI no encontrado".
// Forzamos la detección automática de long-polling, mucho más tolerante
// a ese tipo de redes, para que getFirestore(firebaseconn) en el resto de
// la app use esta configuración.
initializeFirestore(firebaseconn, {
  experimentalAutoDetectLongPolling: true,
});
