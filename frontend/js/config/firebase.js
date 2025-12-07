// Firebase Client SDK Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your Firebase configuration
// Replace with YOUR actual config from Firebase Console
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCR669nc7foCmE1aL4ejxayyWFAptGccTY",
  authDomain: "video-game-bulletin-22375.firebaseapp.com",
  databaseURL: "https://video-game-bulletin-22375-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "video-game-bulletin-22375",
  storageBucket: "video-game-bulletin-22375.firebasestorage.app",
  messagingSenderId: "345428969750",
  appId: "1:345428969750:web:195896a4f51093a756e837"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };