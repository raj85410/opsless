import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDyjBVBfcks2zaCgrtIEJb2WE4wmmDpdvk",
  authDomain: "devxautodeploy.firebaseapp.com",
  projectId: "devxautodeploy",
  storageBucket: "devxautodeploy.firebasestorage.app",
  messagingSenderId: "239654694074",
  appId: "1:239654694074:web:0c27b77b474fed814c2683",
  measurementId: "G-81P1D1GN53"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;