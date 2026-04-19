import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFo8d9gmsHjkaHUs4KKuAg0gTG_XkbqJU",
  authDomain: "unlox-ai.firebaseapp.com",
  projectId: "unlox-ai",
  storageBucket: "unlox-ai.firebasestorage.app",
  messagingSenderId: "654590884488",
  appId: "1:654590884488:web:d464018d89d2be38f03d3d",
  measurementId: "G-FESY63ZKG0"
};

// Initialize Firebase securely for Next.js to prevent re-initialization errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { app, auth, googleProvider, storage };
