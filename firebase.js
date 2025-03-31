// firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC960BbKmuffup-7SoX8HooaDdYPGic4Fc",
  authDomain: "empower-her-6378d.firebaseapp.com",
  projectId: "empower-her-6378d",
  storageBucket: "empower-her-6378d.appspot.com",
  messagingSenderId: "801085400810",
  appId: "1:801085400810:web:9aaaae2a83d5688e351993",
  measurementId: "G-BQY2CGC175",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

// Wrap analytics initialization with isSupported check
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, db, storage, analytics };
