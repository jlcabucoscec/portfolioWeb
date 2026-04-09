import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAg2yVACpKlF2IyLIEBOcX5HIGdX2xDAP0",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portfolioweb-7ea04.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portfolioweb-7ea04",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portfolioweb-7ea04.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "869933875215",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || "1:869933875215:web:7e09721b7dcc815541a37a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T2SGETK71K",
};

const app = initializeApp(firebaseConfig);

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);
