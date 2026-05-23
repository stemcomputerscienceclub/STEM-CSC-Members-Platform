// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

  // Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyBWCcNE4XmKJ59K7QB-7oacQo4ytMhPih0",
    authDomain: "online-chapter-2026.firebaseapp.com",
    projectId: "online-chapter-2026",
    storageBucket: "online-chapter-2026.firebasestorage.app",
    messagingSenderId: "772661224982",
    appId: "1:772661224982:web:d54a4c3fb9c777853b3737"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
