import { initializeApp } from "firebase/app"

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
