// firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC960BbKmuffup-7SoX8HooaDdYPGic4Fc",
  authDomain: "empower-her-6378d.firebaseapp.com",
  projectId: "empower-her-6378d",
  storageBucket: "empower-her-6378d.appspot.com", // Make sure this is correct!
  messagingSenderId: "801085400810",
  appId: "1:801085400810:web:9aaaae2a83d5688e351993",
  measurementId: "G-BQY2CGC175",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, analytics };
