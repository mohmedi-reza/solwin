// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9e-OtCaX5DdQ-JrW1p4KWEfLSLLnhu3U",
  authDomain: "rocket-bet-game.firebaseapp.com",
  projectId: "rocket-bet-game",
  storageBucket: "rocket-bet-game.firebasestorage.app",
  messagingSenderId: "932413346481",
  appId: "1:932413346481:web:a40871dbb6ecf2436e4890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
