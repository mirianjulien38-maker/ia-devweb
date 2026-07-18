import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore DB (Ensure the exact database ID is set)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider helper
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
