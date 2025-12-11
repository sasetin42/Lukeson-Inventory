
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBsmEybb-ASyKOifiWleLs9kZsy2NMwAJQ",
  authDomain: "lukeson-inventory.firebaseapp.com",
  projectId: "lukeson-inventory",
  storageBucket: "lukeson-inventory.appspot.com",
  messagingSenderId: "365879575919",
  appId: "1:365879575919:web:68ff2291b1aca7441f149a"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
