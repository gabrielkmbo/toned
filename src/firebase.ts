import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCSdSl2lNorkPmixZusrLFz7pU5LxxJq0c",
  authDomain: "toned-460c8.firebaseapp.com",
  projectId: "toned-460c8",
  storageBucket: "toned-460c8.firebasestorage.app",
  messagingSenderId: "11298958020",
  appId: "1:11298958020:web:efa6167bd812c2c16c7791",
  measurementId: "G-29LPZH1CKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth }; 