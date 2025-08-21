
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "lukeson-inventory",
  "appId": "1:365879575919:web:68ff2291b1aca7441f149a",
  "storageBucket": "lukeson-inventory.firebasestorage.app",
  "apiKey": "AIzaSyBsmEybb-ASyKOifiWleLs9kZsy2NMwAJQ",
  "authDomain": "lukeson-inventory.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "365879575919"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const storage = getStorage(app);
