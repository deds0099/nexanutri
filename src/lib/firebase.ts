import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAneC5RIK5wKILjWG_ARw88tF5pXGrIGeE",
  authDomain: "nexanutri.firebaseapp.com",
  projectId: "nexanutri",
  storageBucket: "nexanutri.firebasestorage.app",
  messagingSenderId: "666241520410",
  appId: "1:666241520410:web:8dfeffaf0cc731b21992a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
