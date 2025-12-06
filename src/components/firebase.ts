import { initializeApp, FirebaseApp } from "firebase/app";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAnjDvxTUCDNtOTfl_LoJKs0ejCaKQ5MFM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "zwiftworkout.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://zwiftworkout.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "zwiftworkout",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "zwiftworkout.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1029540478836",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1029540478836:web:c951e0c72508468a9ef621",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-1B0S5TVM5F",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
