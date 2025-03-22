import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // ✅ Add this line

const firebaseConfig = {
  apiKey: "AIzaSyAB1W9rr4h2YLURdaE9YorBJF1ojEelb5Q",
  authDomain: "saylani-page-1a89e.firebaseapp.com",
  projectId: "saylani-page-1a89e",
  storageBucket: "saylani-page-1a89e.appspot.com",
  messagingSenderId: "959689788810",
  appId: "1:959689788810:web:a5e3aad9bfe2908ab9cc73"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);