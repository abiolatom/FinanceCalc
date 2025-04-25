import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

let auth: any = null;
let db: any = null;
let googleAuthProvider: any = null;
let firebaseApp: FirebaseApp | null = null;

try {
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    if (!apiKey) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_API_KEY");
    }
    if (!authDomain) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    }
    if (!projectId) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    }
    if (!storageBucket) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    }
    if (!messagingSenderId) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
    }
    if (!appId) {
      console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_APP_ID");
    }
    throw new Error('Missing Firebase configuration variables.');
  }

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  console.log("Firebase initialized successfully!");

  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  googleAuthProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle the error appropriately, e.g., set a flag to indicate Firebase is not available
}

export { auth, db, googleAuthProvider, firebaseApp };

