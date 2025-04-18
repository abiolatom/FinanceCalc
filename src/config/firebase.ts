import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

let missingConfig = false;

if (!apiKey) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_API_KEY");
  missingConfig = true;
}
if (!authDomain) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
   missingConfig = true;
}
if (!projectId) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID");
   missingConfig = true;
}
if (!storageBucket) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
   missingConfig = true;
}
if (!messagingSenderId) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
   missingConfig = true;
}
if (!appId) {
  console.warn("Firebase configuration is missing: NEXT_PUBLIC_FIREBASE_APP_ID");
  missingConfig = true;
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

if (getApps().length === 0 && !missingConfig) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
  } catch (error: any) {
    console.error("Failed to initialize Firebase:", error);
    // Don't throw an error here, as it prevents the app from rendering.
    // Instead, log the error and allow the app to continue (with limited functionality).
  }
} else {
  firebaseApp = getApps()[0];
}

let auth: any;
let db: any;
let googleAuthProvider: any;

if (firebaseApp) {
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  googleAuthProvider = new GoogleAuthProvider();
}

export { auth, db, googleAuthProvider, firebaseApp };
