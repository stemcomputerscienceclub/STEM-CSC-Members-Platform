// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADstvloS_gv1V09WrsiBIpqXVC1iDnq4I",
  authDomain: "form-cs.firebaseapp.com",
  projectId: "form-cs",
  storageBucket: "form-cs.firebasestorage.app",
  messagingSenderId: "846877894058",
  appId: "1:846877894058:web:ed3e1e2f5245214fea37d3",
  measurementId: "G-RQ8F3FR7LB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
