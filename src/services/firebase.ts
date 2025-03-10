
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCELIGZ0X8pjKzdO-N1LOp7jCC1Oi94Lo0",
  authDomain: "children-church.firebaseapp.com",
  projectId: "children-church",
  storageBucket: "children-church.firebasestorage.app",
  messagingSenderId: "177588895218",
  appId: "1:177588895218:web:f9cc2ff6a54c75e5167f6b",
  measurementId: "G-8Z2DC7R550"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, {
      displayName,
      photoURL
    });
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};

// Check if email is a demo account
export const isDemoEmail = (email: string): boolean => {
  return email.endsWith('@church.org') && 
    (email === 'admin@church.org' || 
     email === 'teacher@church.org' || 
     email === 'parent@church.org');
};

export { app, auth, db, storage };
