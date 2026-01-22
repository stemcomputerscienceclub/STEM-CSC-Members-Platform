// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

  // Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAASMdxsb__WKXJYtNu2A-CFLADqCwRGo4",
  authDomain: "stem-csc-members.firebaseapp.com",
  projectId: "stem-csc-members",
  storageBucket: "stem-csc-members.firebasestorage.app",
  messagingSenderId: "523867315988",
  appId: "1:523867315988:web:ced7474cd7f4f4e2d4ec01"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
