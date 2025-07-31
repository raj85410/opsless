import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDyjBVBfcks2zaCgrtIEJb2WE4wmmDpdvk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devxautodeploy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devxautodeploy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devxautodeploy.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "239654694074",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:239654694074:web:0c27b77b474fed814c2683",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-81P1D1GN53"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;