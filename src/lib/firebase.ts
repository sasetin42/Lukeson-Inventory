
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "lukeson-inventory",
  "appId": "1:365879575919:web:68ff2291b1aca7441f149a",
  "storageBucket": "lukeson-inventory.appspot.com",
  "apiKey": "AIzaSyBsmEybb-ASyKOifiWleLs9kZsy2NMwAJQ",
  "authDomain": "lukeson-inventory.firebaseapp.com",
  "messagingSenderId": "365879575919"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
