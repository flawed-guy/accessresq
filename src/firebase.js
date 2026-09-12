import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM32ndPVpRrDNJ0Gct2nE8y18Acrnb_qE",
  authDomain: "loopers-37c2c.firebaseapp.com",
  projectId: "loopers-37c2c",
  storageBucket: "loopers-37c2c.firebasestorage.app",
  messagingSenderId: "562921457102",
  appId: "1:562921457102:web:576788493ac863ef02979f",
  measurementId: "G-7M1V4NMQ2V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;