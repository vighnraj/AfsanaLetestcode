import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseAuthConfig = {
  apiKey: "AIzaSyCtWad_zZa4xNKBZDReNdHYkJTbiRkXTGM",
  authDomain: "student-portal-ea3ae.firebaseapp.com",
  projectId: "student-portal-ea3ae",
  storageBucket: "student-portal-ea3ae.appspot.com",
  messagingSenderId: "512513049858",
  appId: "1:512513049858:web:881326478b97b0665ae1b",
  measurementId: "G-FT65V9SCGX"
};

const authApp = initializeApp(firebaseAuthConfig, "authApp"); // 🔹 custom name
const auth = getAuth(authApp);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
