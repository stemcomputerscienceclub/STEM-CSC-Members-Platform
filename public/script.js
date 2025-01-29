/* script.js */

// ===========================
// Matrix Animation
// ===========================
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const chars = 'ABCDEF0123456789'.split('');
const drops = [];
const fontSize = 14;
const columns = width / fontSize;

for (let i = 0; i < columns; i++) {
  drops[i] = 1;
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 24, 48, 0.05)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0066CC';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    // Reset drop
    if (drops[i] * fontSize > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

setInterval(drawMatrix, 50);

// ===========================
// Typing Animation
// ===========================
const typingText = document.querySelector('.typing-text');
const text = typingText ? typingText.textContent : '';
if (typingText) {
  typingText.textContent = '';
}

let charIndex = 0;
function typeText() {
  if (!typingText) return;
  if (charIndex < text.length) {
    typingText.textContent += text.charAt(charIndex);
    charIndex++;
    setTimeout(typeText, 50);
  }
}
setTimeout(typeText, 1000);

// ===========================
// Word Count Utility
// ===========================
function countWords(str) {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// ===========================
// Dynamic Word Count Handling
// ===========================
function updateWordCount(textarea) {
  try {
    // Only process textareas that should have word counts
    if (!textarea.dataset.wordLimit) return;

    // Find the word count span
    const counter = textarea.nextElementSibling;
    if (!counter || !counter.classList.contains('word-count')) return;

    // Count words
    const words = countWords(textarea.value);

    // Get the word limit
    const limit = parseInt(textarea.dataset.wordLimit, 10);

    // Update the counter text and styling
    if (words > limit) {
      counter.textContent = `${words}/${limit} words (Too many words)`;
      counter.classList.add('error');
    } else if (limit === 200 && words < limit) {
      counter.textContent = `${words}/${limit} words (need ${limit - words} more)`;
      counter.classList.add('error');
    } else {
      counter.textContent = `${words}/${limit} words`;
      counter.classList.remove('error');
    }
  } catch (error) {
    console.error('Error updating word count:', error);
  }
}

function initializeWordCounts() {
  const textareas = document.querySelectorAll('textarea[data-word-limit]');
  textareas.forEach(textarea => {
    updateWordCount(textarea);
    textarea.addEventListener('input', () => updateWordCount(textarea));
  });
}

// ===========================
// Form Handling
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'csClubFormProgress';
  let currentStep = 1;
  let formData = new FormData();

  const form = document.getElementById('membershipForm');
  const sections = document.querySelectorAll('.form-section');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const experienceRadios = document.querySelectorAll('input[name="hasExperience"]');
  const experienceDetails = document.getElementById('experienceDetails');
  const checkboxes = document.querySelectorAll('input[name="tracks"]');
  const modal = document.getElementById('successModal');

  // 1. Initialize dynamic word counts
  initializeWordCounts();

  // 2. Load any saved progress from localStorage
  loadFormProgress();

  // 3. Debounce saving progress on input changes
  const debouncedSave = debounce(saveFormProgress, 300);
  document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('input', debouncedSave);
    element.addEventListener('change', debouncedSave);
  });

  // 4. Step navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < sections.length) {
        goToStep(currentStep + 1);
      } else {
        // Final step => attempt form submission
        if (validateStep(currentStep)) {
          submitForm();
        }
      }
    });
  }

  // 5. Floating labels
  document.querySelectorAll('.floating-input-group input, .floating-input-group textarea').forEach((field) => {
    const label = field.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      // If there's already a value, keep label floated
      if (field.value.trim()) {
        label.classList.add('float');
      }
      field.addEventListener('focus', () => {
        label.classList.add('float');
      });
      field.addEventListener('blur', () => {
        if (!field.value.trim()) {
          label.classList.remove('float');
        }
      });
    }
  });

  // 6. Experience radio toggle
  experienceRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (experienceDetails) {
        experienceDetails.style.display = radio.value === 'yes' ? 'block' : 'none';
      }
    });
  });

  // 7. Limit track selection to max 2
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const checked = document.querySelectorAll('input[name="tracks"]:checked');
      checkboxes.forEach((cb) => {
        if (checked.length >= 2 && !cb.checked) {
          cb.disabled = true;
        } else {
          cb.disabled = false;
        }
      });
    });
  });

  // ===========================
  // Loading & Saving Progress
  // ===========================
  function loadFormProgress() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;
    const data = JSON.parse(savedData);

    // Restore all fields
    Object.keys(data).forEach(key => {
      if (key === 'currentStep') return;
      const element = document.getElementById(key);
      if (element) {
        // Handle radio/checkbox
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = data[key];
        } else {
          // text, email, tel, textarea
          element.value = data[key];
          // Float label if needed
          const label = element.previousElementSibling;
          if (label && label.tagName === 'LABEL' && data[key]) {
            label.classList.add('float');
          }
        }
      }
    });

    // Restore current step
    if (data.currentStep) {
      goToStep(parseInt(data.currentStep, 10));
    }

    // Update word counts after load
    document.querySelectorAll('textarea[data-word-limit]').forEach(updateWordCount);
  }

  function saveFormProgress() {
    const toSave = {};

    // Save text inputs and textareas
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea')
      .forEach(field => {
        if (field.id) {
          toSave[field.id] = field.value;
        }
      });

    // Save radio states
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      if (radio.checked) {
        toSave[radio.id] = radio.checked;
      }
    });

    // Save checkbox states
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      toSave[checkbox.id] = checkbox.checked;
    });

    // Save current step
    toSave.currentStep = currentStep;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    showSaveIndicator();
  }

  function clearFormProgress() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function showSaveIndicator() {
    const indicator = document.querySelector('.save-indicator');
    if (indicator) {
      indicator.classList.add('show');
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
    }
  }

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ===========================
  // Step Navigation & Validation
  // ===========================
  function goToStep(step) {
    if (step < 1 || step > sections.length) return;
    
    // If moving forward, validate the current step first
    if (step > currentStep) {
      if (!validateStep(currentStep)) {
        return;
      }
    }
    currentStep = step;

    // Show/hide sections
    sections.forEach(section => {
      section.classList.remove('active');
      if (parseInt(section.dataset.step, 10) === step) {
        section.classList.add('active');
      }
    });

    // Update step indicators
    const stepIndicators = document.querySelectorAll('.step');
    stepIndicators.forEach(s => {
      s.classList.remove('active', 'completed');
      const stepNum = parseInt(s.dataset.step, 10);
      if (stepNum < step) s.classList.add('completed');
      if (stepNum === step) s.classList.add('active');
    });

    // Button states
    if (step === 1) {
      prevBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'inline-block';
    }
    if (step === sections.length) {
      nextBtn.innerHTML = 'Submit Application';
    } else {
      nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }

    // Save progress after changing steps
    saveFormProgress();
  }

  // Collect data from the section
  function saveStepData(step) {
    const section = document.querySelector(`.form-section[data-step="${step}"]`);
    if (!section) return;
    const inputs = section.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        // If multiple tracks are selected
        if (input.name === 'tracks') {
          const tracks = Array.from(
            document.querySelectorAll('input[name="tracks"]:checked')
          ).map(cb => cb.value);
          formData.set('tracks', tracks);
        }
      } else if (input.type === 'radio') {
        if (input.checked) {
          formData.set(input.name, input.value);
        }
      } else {
        formData.set(input.name, input.value);
      }
    });
  }

  // Validate each step
  function validateStep(step) {
    const section = document.querySelector(`.form-section[data-step="${step}"]`);
    if (!section) return true;

    // Clear old errors
    section.querySelectorAll('.error-message').forEach(err => err.remove());
    section.querySelectorAll('.error').forEach(e => e.classList.remove('error'));

    let valid = true;
    switch (step) {
      case 1:
        valid = validatePersonalInfo(section);
        break;
      case 2:
        valid = validateTrackSelection(section);
        break;
      case 3:
        valid = validateEssays(section);
        break;
      case 4:
        valid = validateExperience(section);
        break;
      default:
        valid = true;
    }
    return valid;
  }

  function validatePersonalInfo(section) {
    const fullName = section.querySelector('#fullName');
    const whatsapp = section.querySelector('#whatsapp');
    const email = section.querySelector('#email');
    const grade = section.querySelector('input[name="grade"]:checked');

    let isValid = true;

    // Name
    if (!fullName.value.trim()) {
      showFieldError(fullName, 'Please enter your full name');
      isValid = false;
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(fullName.value.trim())) {
      showFieldError(fullName, 'Please enter a valid name (2-50 letters)');
      isValid = false;
    }

    // WhatsApp
    if (!whatsapp.value.trim()) {
      showFieldError(whatsapp, 'Please enter your WhatsApp number');
      isValid = false;
    } else if (!/^\+?[\d\s-]{10,15}$/.test(whatsapp.value.trim())) {
      showFieldError(whatsapp, 'Please enter a valid phone number');
      isValid = false;
    }

    // Email
    if (!email.value.trim()) {
      showFieldError(email, 'Please enter your school email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showFieldError(email, 'Please enter a valid email address');
      isValid = false;
    }

    // Grade
    // if (!grade) {
    //   showSectionError(section, 'Please select your grade');
    //   isValid = false;
    // }

    return isValid;
  }

  function validateTrackSelection(section) {
    const selected = section.querySelectorAll('input[name="tracks"]:checked');
    if (selected.length === 0) {
      showSectionError(section, 'Please select at least one track');
      return false;
    }
    if (selected.length > 2) {
      showSectionError(section, 'Please select a maximum of two tracks');
      return false;
    }
    return true;
  }

  function validateEssays(section) {
    const trackEssay = document.getElementById('trackEssay');
    const techEssay = document.getElementById('techEssay');

    const trackWords = countWords(trackEssay.value);
    const techWords = countWords(techEssay.value);

    let valid = true;

    // Track Essay => maximum 200 words
    if (trackWords === 0) {
      showFieldError(trackEssay, 'Please write about your interest in the chosen track(s)');
      valid = false;
    } else if (trackWords < 200) {
      showFieldError(
        trackEssay,
        `Please write at least 200 words (currently: ${trackWords})`
      );
      valid = false;
    }

    // Tech Essay => minimum 200 words
    if (techWords === 0) {
      showFieldError(techEssay, 'Please write about a CS advancement');
      valid = false;
    } else if (techWords < 200) {
      showFieldError(
        techEssay,
        `Please write at least 200 words (currently: ${techWords})`
      );
      valid = false;
    }

    return valid;
  }

  function validateExperience(section) {
    const hasExperience = section.querySelector('input[name="hasExperience"]:checked');
    const experienceText = document.getElementById('experience');

    let valid = true;

    if (!hasExperience) {
      showSectionError(section, 'Please indicate if you have experience');
      valid = false;
    } else if (hasExperience.value === 'yes' && !experienceText.value.trim()) {
      showFieldError(experienceText, 'Please describe your experience');
      valid = false;
    }

    return valid;
  }

  // Error helper messages
  function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    field.classList.add('error');
    
    // Remove error on next input
    field.addEventListener('input', function removeError() {
      errorDiv.remove();
      field.classList.remove('error');
      field.removeEventListener('input', removeError);
    });
  }

  function showSectionError(section, message) {
    // Prevent stacking multiple errors
    if (!section.querySelector('.error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      section.insertBefore(errorDiv, section.firstChild);

      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  // ===========================
  // Submitting the Form
  // ===========================
  async function submitForm() {
    // Gather any final step data
    saveStepData(currentStep);

    // Show a loading state on the button
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
      // Simulate an API call or backend submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success modal
      modal.classList.add('active');
      modal.style.display = 'block';

      // Animate loading bar
      const loadingBar = modal.querySelector('.loading-bar');
      loadingBar.style.width = '100%';

      // Reset form after submission
      setTimeout(() => {
        form.reset();
        goToStep(1);

        nextBtn.disabled = false;
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';

        // Clear floating labels
        document.querySelectorAll('.floating-input-group label').forEach((label) => {
          label.classList.remove('float');
        });

        // Clear local storage progress
        clearFormProgress();
      }, 1000);
    } catch (error) {
      showSectionError(form, 'An error occurred. Please try again.');
      nextBtn.disabled = false;
      nextBtn.innerHTML = 'Submit Application';
    }
  }
});

// ===========================
// Modal Close Function
// ===========================
function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
    const loadingBar = modal.querySelector('.loading-bar');
    if (loadingBar) loadingBar.style.width = '0';
  }, 300);
}

// Close modal if user clicks outside of it
window.onclick = function (event) {
  const modal = document.getElementById('successModal');
  if (event.target === modal) {
    closeModal();
  }
};

// ===========================
// Smooth Scrolling (Optional)
// ===========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});
