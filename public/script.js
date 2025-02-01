document.addEventListener('DOMContentLoaded', () => {
  /* =========================
     Tab Switching Functionality
  ========================== */
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      tabLinks.forEach(tab => tab.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      link.classList.add('active');
      const targetId = link.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  /* =========================
     Multi-Step Form Navigation
  ========================== */
  let currentStep = 1;
  const totalSteps = 3;
  const formSections = document.querySelectorAll('.form-section');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  function updateFormSteps() {
    formSections.forEach(section => {
      section.classList.remove('active');
      if (parseInt(section.getAttribute('data-step')) === currentStep) {
        section.classList.add('active');
      }
    });
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
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
    // Update navigation buttons
    if (prevBtn) {
      prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    }
    if (nextBtn) {
      nextBtn.innerHTML = currentStep === totalSteps ? 'Submit <i class="fas fa-check"></i>' : 'Next <i class="fas fa-arrow-right"></i>';
    }
    updateSaveIndicator('All changes saved');
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 1);
      updateFormSteps();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep === totalSteps) {
          // Trigger form submission
          document.getElementById('membershipForm').dispatchEvent(new Event('submit', { cancelable: true }));
        } else {
          currentStep = Math.min(currentStep + 1, totalSteps);
          updateFormSteps();
        }
      }
    });
  }

  /* =========================
     Word Count Functionality
  ========================== */
  function updateWordCount(textarea) {
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/) : [];
    const count = words.length;
    const wordCountEl = textarea.parentElement.querySelector('.word-count');
    if (wordCountEl) {
      const maxWords = textarea.getAttribute('data-max-words') || 200;
      if (textarea.hasAttribute('data-max-words')) {
        wordCountEl.textContent = `${count}/${maxWords} words`;
      } else {
        wordCountEl.textContent = `${count} words`;
      }
    }
  }
  
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', () => updateWordCount(textarea));
  });

  /* =========================
     Step Validation
  ========================== */
  function validateStep(step) {
    let isValid = true;
    const section = document.querySelector(`.form-section[data-step="${step}"]`);
    if (!section) return false;
    const requiredInputs = section.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
      if (input.type === 'radio') {
        const radios = section.querySelectorAll(`input[name="${input.name}"]`);
        const checked = Array.from(radios).some(radio => radio.checked);
        if (!checked) {
          isValid = false;
          showInputError(input.parentElement, 'Please select an option');
        } else {
          removeInputError(input.parentElement);
        }
      } else if (!input.value.trim()) {
        isValid = false;
        input.classList.add('error');
        showInputError(input, 'This field is required');
      } else if (input.hasAttribute('data-min-words')) {
        const minWords = parseInt(input.getAttribute('data-min-words'));
        const wordCount = input.value.trim().split(/\s+/).length;
        if (wordCount < minWords) {
          isValid = false;
          showInputError(input, `Minimum ${minWords} words required`);
        } else {
          removeInputError(input);
        }
      } else {
        input.classList.remove('error');
        removeInputError(input);
      }
    });
    return isValid;
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

  function updateSaveIndicator(message) {
    const saveIndicator = document.querySelector('.save-indicator');
    const saveText = document.querySelector('.save-text');
    if (saveText) {
      saveText.textContent = message;
      saveIndicator.classList.add('show');
      setTimeout(() => {
        saveIndicator.classList.remove('show');
      }, 2000);
    }
  }

  updateFormSteps();

  /* =========================
     Toggle Experience Details
  ========================== */
  const expRadios = document.querySelectorAll('input[name="hasExperience"]');
  const expDetails = document.getElementById('experienceDetails');
  expRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (expDetails) {
        if (radio.value === 'yes') {
          expDetails.style.display = 'block';
          expDetails.querySelector('textarea').required = true;
        } else {
          expDetails.style.display = 'none';
          expDetails.querySelector('textarea').required = false;
        }
      }
    });
  });

  /* =========================
     Countdown Timer
  ========================== */
  function updateCountdown() {
    const deadline = new Date('2025-02-28T23:59:59').getTime();
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

    if (timeLeft < 0) {
      clearInterval(countdownInterval);
      const countdownSection = document.querySelector('.countdown-section');
      if (countdownSection) {
        countdownSection.innerHTML = '<h3>Application period has ended</h3>';
      }
    }
  }
  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  /* =========================
     Firebase Authentication & User Data
  ========================== */
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
    loadUserData(user.uid);
  });

  async function loadUserData(userId) {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const whatsappInput = document.getElementById('whatsapp');
        if (fullNameInput && userData.fullName) fullNameInput.value = userData.fullName;
        if (emailInput && userData.email) emailInput.value = userData.email;
        if (whatsappInput && userData.whatsapp) whatsappInput.value = userData.whatsapp;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  const signOutButton = document.getElementById('signOut');
  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      try {
        await firebase.auth().signOut();
        window.location.href = 'auth.html';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });
  }

  /* =========================
     Form Submission Handler
  ========================== */
  const membershipForm = document.getElementById('membershipForm');
  if (membershipForm) {
    membershipForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = firebase.auth().currentUser;
      if (!user) {
        alert('Please sign in to submit your application.');
        return;
      }
      // Collect data from Step 1
      const fullName = document.getElementById('fullName').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const email = document.getElementById('email').value.trim();
      const grade = document.getElementById('grade').value.trim();
      // Collect selected tracks
      const trackCheckboxes = document.querySelectorAll('input[name="tracks"]:checked');
      const selectedTracks = Array.from(trackCheckboxes).map(cb => cb.value);
      
      // Data from Step 2 (Essays)
      const trackEssay = document.getElementById('trackEssay').value.trim();
      const techEssay = document.getElementById('techEssay').value.trim();
      
      // Data from Step 3 (Experience)
      const hasExperienceVal = document.querySelector('input[name="hasExperience"]:checked') 
                                ? document.querySelector('input[name="hasExperience"]:checked').value 
                                : 'no';
      const experienceDetails = document.getElementById('experience').value.trim();
      const additionalInformation = document.getElementById('additional').value.trim();

      // Structure the form data (similar to your sample JSON)
      const formData = {
        personalInformation: {
          fullName,
          whatsapp,
          email,
          grade
        },
        trackSelection: {
          selectedTracks
        },
        essays: {
          trackEssay,
          techEssay
        },
        experience: {
          hasExperience: hasExperienceVal === 'yes',
          experienceDetails: hasExperienceVal === 'yes' ? experienceDetails : '',
          additionalInformation
        },
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        status: 'pending'
      };

      try {
        // Save the application into Firestore
        const applicationRef = await firebase.firestore().collection('applications').add(formData);
        console.log('Application submitted with ID:', applicationRef.id);
        // Optionally update the user document to mark submission
        await firebase.firestore().collection('users').doc(user.uid).update({
          hasSubmittedApplication: true,
          applicationSubmittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Show the success modal
        const successModal = document.getElementById('successModal');
        if (successModal) {
          successModal.classList.add('active');
        }
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = 'thank-you.html';
        }, 2000);
      } catch (error) {
        console.error('Error submitting application:', error);
        alert('Error submitting application: ' + error.message);
      }
    });
  }
});

/* =========================
   Modal Close Function
========================= */
function closeModal() {
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.classList.remove('active');
  }
}
