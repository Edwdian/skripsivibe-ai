import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY0YhUEj4Wez1_HTWv1X8SXYUOhT4Fm8g",
  authDomain: "skripsivibe-ai.firebaseapp.com",
  projectId: "skripsivibe-ai",
  storageBucket: "skripsivibe-ai.firebasestorage.app",
  messagingSenderId: "450550862976",
  appId: "1:450550862976:web:d29590d523b1cac6f68265",
  measurementId: "G-7N341KWXFR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);