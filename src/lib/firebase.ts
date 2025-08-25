
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "lukeson-inventory",
  appId: "1:365879575919:web:68ff2291b1aca7441f149a",
  storageBucket: "lukeson-inventory.firebasestorage.app",
  apiKey: "AIzaSyBsmEybb-ASyKOifiWleLs9kZsy2NMwAJQ",
  authDomain: "lukeson-inventory.firebaseapp.com",
  messagingSenderId: "365879575919"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
