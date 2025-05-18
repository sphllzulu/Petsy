// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// import { getDatabase } from 'firebase/database';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCuPUDGBKWUMT0A1Z5Io7dk_-2Zasp_TpU",
//   authDomain: "petsy-e9a24.firebaseapp.com",
//   projectId: "petsy-e9a24",
//   storageBucket: "petsy-e9a24.firebasestorage.app",
//   messagingSenderId: "641887981582",
//   appId: "1:641887981582:web:78300fd243e953e107ec5f"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);
// const firestore = getFirestore(app);
// const storage = getStorage(app);
// const rtdb = getDatabase(app);

// export { auth, firestore, storage, rtdb };

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuPUDGBKWUMT0A1Z5Io7dk_-2Zasp_TpU",
  authDomain: "petsy-e9a24.firebaseapp.com",
  projectId: "petsy-e9a24",
  storageBucket: "petsy-e9a24.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "641887981582",
  appId: "1:641887981582:web:78300fd243e953e107ec5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { auth, firestore, storage, rtdb };