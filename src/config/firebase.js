import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiGRAftmUp4s53z-ZB45-3Z_4VU9bray4",
  authDomain: "nexus-ecom-c7d51.firebaseapp.com",
  projectId: "nexus-ecom-c7d51",
  storageBucket: "nexus-ecom-c7d51.firebasestorage.app",
  messagingSenderId: "136697589967",
  appId: "1:136697589967:web:9833406edddab711c607ba",
  measurementId: "G-PQMB7L73LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
