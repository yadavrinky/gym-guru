import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFo8d9gmsHjkaHUs4KKuAg0gTG_XkbqJU",
  authDomain: "unlox-ai.firebaseapp.com",
  projectId: "unlox-ai",
  storageBucket: "unlox-ai.firebasestorage.app",
  messagingSenderId: "654590884488",
  appId: "1:654590884488:web:d464018d89d2be38f03d3d",
  measurementId: "G-FESY63ZKG0",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
