import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUMuizw8GFxjSwFAeZcC8HvLNyb20ZJM0",
  authDomain: "fxcompare-1b2be.firebaseapp.com",
  projectId: "fxcompare-1b2be",
  storageBucket: "fxcompare-1b2be.firebasestorage.app",
  messagingSenderId: "257694627949",
  appId: "1:257694627949:web:01f31e2ede05c1d5e1a764",
};

export const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence:
        getReactNativePersistence(
          AsyncStorage
        ),
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const firestore =
  getFirestore(firebaseApp);