// Matrix Animation
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const chars = '01'.split('');
const fontSize = 14;
const columns = Math.floor(width / fontSize);
const drops = new Array(columns).fill(1);

let lastTime = 0;
const FPS = 15;
const frameDelay = 1000 / FPS;

function drawMatrix(currentTime) {
    if (currentTime - lastTime < frameDelay) {
        requestAnimationFrame(drawMatrix);
        return;
    }

    lastTime = currentTime;

    ctx.fillStyle = 'rgba(10, 25, 47, 0.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(168, 85, 247, 0.35)";

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    requestAnimationFrame(drawMatrix);
}

// Start matrix animation
drawMatrix(0);

// Handle window resize
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    drops.length = Math.floor(width / fontSize);
    drops.fill(1);
}, { passive: true });

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchLinks = document.querySelectorAll('[data-switch]');

// Switch between login and signup forms
switchLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetForm = link.dataset.switch;
        document.querySelector('.auth-form.active').classList.remove('active');
        document.getElementById(`${targetForm}Form`).classList.add('active');
    });
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.parentElement.querySelector('input');
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        button.classList.toggle('fa-eye');
        button.classList.toggle('fa-eye-slash');
    });
});

// Show response message
function showResponse(form, success, message) {
    const existingResponse = form.querySelector('.response-message');
    if (existingResponse) {
        existingResponse.remove();
    }

    const responseDiv = document.createElement('div');
    responseDiv.className = `response-message ${success ? 'success' : 'error'}`;
    responseDiv.innerHTML = `
        <i class="fas fa-${success ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.parentNode.insertBefore(responseDiv, submitButton);

    if (success) {
        setTimeout(() => {
            window.location.href = 'form.html';
        }, 1500);
    }
}

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Handle Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!validateEmail(email)) {
        showResponse(loginForm, false, 'Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showResponse(loginForm, false, 'Password must be at least 6 characters');
        return;
    }

    try {
        console.log('Attempting to sign in with:', email);
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('Sign in successful:', userCredential.user.uid);
        localStorage.clear()
        localStorage.setItem("user", userCredential.user.uid)

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        showResponse(loginForm, true, 'Login successful! Redirecting...');
    } catch (error) {
        console.error('Sign in error:', error);
        let errorMessage = 'An error occurred during sign in.';
        console.log(error.code);

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Please make sure that you have created an account with this email before, or recheck your password.';
                break;
            default:
                errorMessage = error.message;
        }

        showResponse(loginForm, false, errorMessage);
    }
});

// Handle Sign Up Form Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!validateEmail(email)) {
        showResponse(signupForm, false, 'Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showResponse(signupForm, false, 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showResponse(signupForm, false, 'Passwords do not match');
        return;
    }

    try {
        console.log('Attempting to create account with:', email);
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('Account creation successful:', userCredential.user.uid);
        localStorage.clear()
        localStorage.setItem("user", userCredential.user.uid)
        // Add user data to Firestore
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showResponse(signupForm, true, 'Account created successfully! Redirecting...');
    } catch (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'An error occurred during sign up.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account already exists with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Please choose a stronger password.';
                break;
            default:
                errorMessage = error.message;
        }

        showResponse(signupForm, false, errorMessage);
    }
});

// Check if user is already signed in
firebase.auth().onAuthStateChanged((user) => {
    if (user && localStorage.getItem("user")) {
        window.location.href = './form.html#announcement';
    } 
});

// Check if user was remembered
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});
