/**********************************************
 * form.js
 **********************************************/

// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyADstvloS_gv1V09WrsiBIpqXVC1iDnq4I",
  authDomain: "form-cs.firebaseapp.com",
  projectId: "form-cs",
  storageBucket: "form-cs.firebasestorage.app", // Adjust if needed
  messagingSenderId: "846877894058",
  appId: "1:846877894058:web:ed3e1e2f5245214fea37d3",
  measurementId: "G-RQ8F3FR7LB"
};
firebase.initializeApp(firebaseConfig);

// Add authentication check
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user || localStorage.getItem("user") != user.uid) {
    // Redirect to auth page if not signed in
    window.location.href = './';
    return;
  }

  if (localStorage.getItem("submitted")) {
    document.getElementById("application").innerHTML = `
      <section id="apply" class="application-form">
        <h1>Your application was already submitted, no decision update yet</h1>
      </section>
    `;
    return;
  }

  sessionStorage.setItem("email", user.email);

  // Save to Firestore
  try {
    const db = firebase.firestore();
    const userDoc = await db.collection('applications').doc(user.email).get();

    if (!userDoc.exists) {
      document.getElementById("application").innerHTML = `
        <section id="apply" class="application-form">
          <h1>Your application was already submitted, no decision update yet</h1>
        </section>
      `;
      return;
    }
  } catch (err) {
    console.error("Error checking application:", err);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /**********************************************
   * Tab Switching
   **********************************************/
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  console.log(tabLinks);

  function switchTab(tabId) {
    // Update active tab link
    tabLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      }
    });

    // Update active tab content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
  }

  // Handle tab clicks
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      // Update URL hash without triggering scroll
      history.pushState(null, null, `#${tabId}`);
      switchTab(tabId);
    });
  });

  // Check URL hash on page load
  if (window.location.hash === '#announcement') {
    console.log("fdfsdfds");

    switchTab('announcement');
  }

  // Handle initial hash on page load
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    switchTab(initialHash);
  } else {
    switchTab('application'); // Default if no hash
  }

  /**********************************************
   * Multi-Step Form Navigation
   **********************************************/
  let currentStep = 1;
  const formSections = document.querySelectorAll('.form-section');
  const totalSteps = formSections.length;
  const backBtn = document.querySelector('.back-btn');
  const nextBtn = document.querySelector('.next-btn');

  function updateFormSteps() {
    // Hide all sections
    formSections.forEach(section => section.classList.remove('active'));

    // Show current section
    const currentSection = document.querySelector(`.form-section[data-step="${currentStep}"]`);
    if (currentSection) currentSection.classList.add('active');

    // Update step indicators
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum < currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNum === currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('completed', 'active');
      }
    });

    // Update back button
    if (backBtn) {
      const isFirstStep = currentStep === 1;
      backBtn.style.opacity = isFirstStep ? '0' : '1';
      backBtn.style.pointerEvents = isFirstStep ? 'none' : 'auto';
    }

    // Update next button
    if (nextBtn) {
      const isLastStep = currentStep === totalSteps;
      nextBtn.innerHTML = isLastStep
        ? '<i class="fas fa-paper-plane"></i> Submit'
        : 'Next <i class="fas fa-arrow-right"></i>';
    }

    // Save form data
  }

  function showInputError(element, message) {
    let errorMsg = element.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      element.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  }

  function removeInputError(element) {
    const errorMsg = element.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  function getWordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  function validateWordCount(input) {
    const minWords = parseInt(input.getAttribute('data-min-words') || '0', 10);
    const maxWords = parseInt(input.getAttribute('data-max-words') || '9999', 10);
    const wordCount = getWordCount(input.value);
    const parent = input.closest('.form-group');

    removeInputError(parent);

    if (wordCount < minWords) {
      showInputError(parent, `Please write at least ${minWords} words.`);
      return false;
    }
    if (wordCount > maxWords) {
      showInputError(parent, `Please keep your response under ${maxWords} words.`);
      return false;
    }
    return true;
  }

  function validateStep(step) {
    let isValid = true;
    const section = document.querySelector(`.form-section[data-step="${step}"]`);
    if (!section) return false;

    // Check required inputs in this section
    const requiredInputs = section.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach((input) => {
      const parent = input.closest('.form-group') || input.parentElement;
      removeInputError(parent);
      input.classList.remove('error');

      if (input.type === 'radio') {
        // For radio buttons
        const radios = section.querySelectorAll(`input[name="${input.name}"]`);
        const checked = Array.from(radios).some(r => r.checked);
        if (!checked) {
          isValid = false;
          showInputError(parent, 'Please select an option');
        }
      } else {
        // For text, email, textarea
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          showInputError(parent, 'This field is required');
        } else if (
          input.hasAttribute('data-min-words') ||
          input.hasAttribute('data-max-words')
        ) {
          // Word count validation
          if (!validateWordCount(input)) {
            isValid = false;
            input.classList.add('error');
          }
        }
      }
    });

    return isValid;
  }

  // Handle form submission
  function submitForm() {
    const membershipForm = document.getElementById('membershipForm');
    if (membershipForm) {
      membershipForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateFormSteps();
        saveFormData();
      }
    });
  }

  // Next/Submit button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateFormSteps();
          saveFormData();
        } else {
          submitForm();
        }
      }
    });
  }

  function loadSavedFormData() {
    const saved = localStorage.getItem('csclubFormData');
    if (!saved) return;

    try {
      const { currentStep: savedStep, fields } = JSON.parse(saved);

      // Populate fields
      Object.keys(fields).forEach((key) => {
        const el = document.getElementById(key);
        if (el) {
          if (el.type === 'radio') {
            // means it was checked
            el.checked = true;
          } else {
            el.value = fields[key];
          }
        }
      });

      // restore step
      if (savedStep && savedStep > 0 && savedStep <= totalSteps) {
        currentStep = savedStep;
      }
    } catch (err) {
      console.warn('Could not parse saved form data:', err);
    }
  }

  function setupAutoSaveListeners() {
    const allInputs = document.querySelectorAll('#membershipForm input, #membershipForm textarea');
    allInputs.forEach((el) => {
      if (el.type === 'radio') {
        el.addEventListener('change', saveFormData);
      } else {
        el.addEventListener('input', saveFormData);
      }
    });
  }

  // Then update steps
  updateFormSteps();
  // Then set up auto-save
  setupAutoSaveListeners();

  /**********************************************
   * Word Count Functionality
   **********************************************/
  function updateWordCount(textarea) {
    const wordCount = getWordCount(textarea.value);
    const maxWords = parseInt(textarea.getAttribute('data-max-words') || '200', 10);
    const minWords = parseInt(textarea.getAttribute('data-min-words') || '0', 10);
    const countDisplay = textarea.nextElementSibling;

    if (countDisplay) {
      countDisplay.textContent = `${wordCount}/${maxWords} words`;
      if (wordCount < minWords || wordCount > maxWords) {
        countDisplay.style.color = '#ff4444';
      } else {
        countDisplay.style.color = '#4CAF50';
      }
    }
  }

  const textareas = document.querySelectorAll('textarea[data-min-words]');
  textareas.forEach(textarea => {
    updateWordCount(textarea);
    textarea.addEventListener('input', () => updateWordCount(textarea));
  });

  /**********************************************
   * Toggle Experience Details
   **********************************************/
  const expRadios = document.querySelectorAll('input[name="hasExperience"]');
  const expDetails = document.getElementById('experienceDetails');
  if (expRadios && expDetails) {
    expRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const textarea = expDetails.querySelector('textarea');
        if (radio.value === 'yes') {
          expDetails.style.display = 'block';
          textarea.required = true;
        } else {
          expDetails.style.display = 'none';
          textarea.required = false;
          textarea.value = '';
        }
        saveFormData();
      });
    });
  }

  /**********************************************
   * Countdown Timer
   **********************************************/
  function updateCountdown() {
    // Adjust your closing date here
    const deadline = new Date('2025-02-11T16:59:59').getTime();
    const now = new Date().getTime();
    const timeLeft = deadline - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    // If time is up
    if (timeLeft < 0) {
      clearInterval(countdownInterval);

      // Disable form
      const form = document.getElementById('membershipForm');
      if (form) {
        const formElements = form.querySelectorAll('input, textarea, button');
        formElements.forEach(element => {
          element.disabled = true;
        });
        // Show message at top
        const formMessage = document.createElement('div');
        formMessage.className = 'form-closed-message';
        formMessage.innerHTML = `
          <div class="alert alert-warning" style="
            background-color: #ff4444;
            color: white;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
          ">
            <i class="fas fa-clock"></i>
            The application period has ended. Applications are no longer being accepted.
          </div>
        `;
        form.insertBefore(formMessage, form.firstChild);
      }

      // Update countdown section
      const countdownSection = document.querySelector('.countdown-section');
      if (countdownSection) {
        countdownSection.innerHTML = `
          <h3 style="color: #ff4444; text-align: center;">
            <i class="fas fa-clock"></i>
            Application period has ended
          </h3>
        `;
      }
    }
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  /**********************************************
   * Firebase Auth & Loading User Data
   **********************************************/
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      console.warn('User not signed in.');
      // Optionally redirect:
      // window.location.href = 'auth.html';
    } else {
      // If authenticated, load user data
      loadUserData(user.email);
    }
  });

    async function loadUserData(userId) {
      try {
        const userDoc = await firebase.firestore().collection('applications').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userNameSpan = document.getElementById('userName');
          const congrats = document.querySelector('#congrats-text');
          userNameSpan.textContent = userData.personalInformation.fullName;
          congrats.innerHTML = userData.feedback;
          console.log(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }

  const signOutButton = document.getElementById('signOut');
  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      try {
        // Clear any stored form data
        localStorage.removeItem('csclubFormData');
        await firebase.auth().signOut();
        window.location.href = './';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });
  }

  /**********************************************
   * Form Submission Handler
   **********************************************/
  const membershipForm = document.getElementById('membershipForm');
  if (membershipForm) {
    membershipForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          alert('Please sign in to submit your application.');
          return;
        }

        // Gather form data
        const formData = {
          personalInformation: {
            fullName: document.getElementById('fullName').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.trim(),
            email: document.getElementById('email').value.trim()
          },
          essays: {
            techEssay: document.getElementById('techEssay').value.trim(),
            goalEssay: document.getElementById('goalEssay').value.trim()
          },
          research: {
            machineLearning: document.getElementById('mlResearch').value.trim(),
          },
          experience: {
            hasExperience:
              document.querySelector('input[name="hasExperience"]:checked')?.value || '',
            experienceDetails: document.getElementById('experience').value.trim(),
            additional: document.getElementById('additional').value.trim()
          },
          metadata: {
            userId: user.uid,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
          }
        };

        // Save to Firestore
        const db = firebase.firestore();
        await db.collection('applications')
          .doc(sessionStorage.getItem("email", user.email))
          .set(formData);

        // Show success modal
        const successModal = document.getElementById('successModal');
        if (successModal) {
          successModal.classList.add('active');
          // Animate loading bar
          const loadingBar = document.getElementById('loadingBar');
          if (loadingBar) {
            setTimeout(() => {
              loadingBar.style.width = '100%';
            }, 100);
          }
        }

        // Clear localStorage since submission is done
        localStorage.removeItem('csclubFormData');

        // Optionally reset form
        membershipForm.reset();
      } catch (error) {
        console.error('Error submitting application:', error);
        alert('An error occurred while submitting. Please try again.');
      }
    });
  }

  /**********************************************
   * Close Modal
   **********************************************/
  window.closeModal = function () {
    const successModal = document.getElementById('successModal');
    if (successModal) {
      successModal.classList.remove('active');
      localStorage.setItem('submitted', true);
      document.getElementById("application").innerHTML = `
        <section id="apply" class="application-form">
          <h1>Your application was already submitted, no decision update yet</h1>
        </section>
      `;
    }
  };

  /**********************************************
   * Matrix Background Animation
   **********************************************/
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initMatrix() {
    resizeCanvas();

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    ctx.font = fontSize + 'px monospace';

    function draw() {
      ctx.fillStyle = 'rgba(0, 24, 48, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0fa';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    let animationFrame;
    function animate() {
      draw();
      animationFrame = requestAnimationFrame(animate);
    }
    animate();

    // Cleanup if needed
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }

  window.addEventListener('resize', resizeCanvas);
  initMatrix();
});
