// Form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('membershipForm');
    const fullNameInput = document.getElementById('fullName');
    const whatsappInput = document.getElementById('whatsapp');
    const emailInput = document.getElementById('email');

    // Validation functions
    function validateFullName(value) {
        if (!value) return 'Full name is required';
        if (value.length < 2) return 'Name must be at least 2 characters long';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name should only contain letters and spaces';
        return '';
    }

    function validateWhatsApp(value) {
        if (!value) return 'WhatsApp number is required';
        if (!/^\+?[0-9]{10,14}$/.test(value)) return 'Please enter a valid phone number (10-14 digits)';
        return '';
    }

    function validateEmail(value) {
        if (!value) return 'School email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
    }

    // Show error message
    function showError(input, message) {
        const errorDiv = document.getElementById(`${input.id}-error`);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            input.classList.add('error');
        }
    }

    // Clear error message
    function clearError(input) {
        const errorDiv = document.getElementById(`${input.id}-error`);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
            input.classList.remove('error');
        }
    }

    // Real-time validation
    fullNameInput.addEventListener('input', function() {
        const error = validateFullName(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    whatsappInput.addEventListener('input', function() {
        const error = validateWhatsApp(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    emailInput.addEventListener('input', function() {
        const error = validateEmail(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    // Form submission validation
    form.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Validate full name
        const nameError = validateFullName(fullNameInput.value);
        if (nameError) {
            showError(fullNameInput, nameError);
            isValid = false;
        }

        // Validate WhatsApp
        const whatsappError = validateWhatsApp(whatsappInput.value);
        if (whatsappError) {
            showError(whatsappInput, whatsappError);
            isValid = false;
        }

        // Validate email
        const emailError = validateEmail(emailInput.value);
        if (emailError) {
            showError(emailInput, emailError);
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});