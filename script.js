document.addEventListener('DOMContentLoaded', () => {
    const locationData = {
        "USA": {
            "California": ["Los Angeles", "San Francisco", "San Diego"],
            "New York": ["New York City", "Buffalo", "Albany"],
            "Texas": ["Houston", "Austin", "Dallas"]
        },
        "India": {
            "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
            "Karnataka": ["Bangalore", "Mysore", "Hubli"],
            "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
        },
        "UK": {
            "England": ["London", "Manchester", "Liverpool"],
            "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"],
            "Wales": ["Cardiff", "Swansea", "Newport"]
        }
    };

    const countryCodes = {
        "USA": "+1",
        "India": "+91",
        "UK": "+44"
    };

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = form.querySelectorAll('input, select');

    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const strengthContainer = document.querySelector('.strength-meter');

    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    for (let country in locationData) {
        let option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    }

    countrySelect.addEventListener('change', function () {
        stateSelect.innerHTML = '<option value="">Select State</option>';
        citySelect.innerHTML = '<option value="">Select City</option>';
        stateSelect.disabled = true;
        citySelect.disabled = true;

        const selectedCountry = this.value;
        const phoneInput = document.getElementById('phone');

        if (selectedCountry) {
            stateSelect.disabled = false;
            const states = Object.keys(locationData[selectedCountry]);
            states.forEach(state => {
                let option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });

            if (countryCodes[selectedCountry] && phoneInput.value === '') {
                phoneInput.value = countryCodes[selectedCountry] + " ";
            }
        }
        validateField(this);
        checkFormValidity();
    });

    stateSelect.addEventListener('change', function () {
        citySelect.innerHTML = '<option value="">Select City</option>';
        citySelect.disabled = true;

        const selectedCountry = countrySelect.value;
        const selectedState = this.value;

        if (selectedCountry && selectedState) {
            citySelect.disabled = false;
            const cities = locationData[selectedCountry][selectedState];
            cities.forEach(city => {
                let option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
        validateField(this);
        checkFormValidity();
    });

    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            input.addEventListener('change', () => {
                validateField(input);
                checkFormValidity();
            });
        } else {
            input.addEventListener('input', () => {
                validateField(input);
                checkFormValidity();
            });
            input.addEventListener('blur', () => {
                validateField(input);
                checkFormValidity();
            });
        }
    });

    passwordInput.addEventListener('input', updatePasswordStrength);

    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                targetInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (checkFormValidity(true)) {
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            setTimeout(() => {
                modal.style.display = 'flex';
                submitBtn.innerHTML = 'Create Account';
                form.reset();
                inputs.forEach(i => {
                    i.classList.remove('valid');
                    i.closest('.input-group')?.querySelector('.error-message')?.classList.remove('visible');
                });
                stateSelect.disabled = true;
                citySelect.disabled = true;
                strengthContainer.classList.remove('active');
                submitBtn.disabled = true;
            }, 1500);
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    function validateField(input) {
        const value = input.value.trim();
        const id = input.id || input.name;
        let isValid = true;
        let errorMessage = "";

        let errorSpan;
        if (input.type === 'radio') {
            errorSpan = document.getElementById('genderError');
        } else {
            errorSpan = document.getElementById(id + 'Error');
        }

        if (input.required && !value && input.type !== 'checkbox' && input.type !== 'radio') {
            isValid = false;
            errorMessage = "This field is required";
        }

        if (input.type === 'radio') {
            const checked = document.querySelector(`input[name="${input.name}"]:checked`);
            if (!checked && input.required) {
                isValid = false;
                errorMessage = "Please select a gender";
            } else {
                isValid = true;
            }
        }

        if (input.type === 'checkbox' && !input.checked) {
            isValid = false;
            errorMessage = "You must agree to the terms";
        }

        if (value) {
            switch (input.name) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = "Invalid email format";
                    } else if (value.includes('@tempmail.com') || value.includes('mailinator.com')) {
                        isValid = false;
                        errorMessage = "Disposable emails are not allowed";
                    }
                    break;

                case 'phone':
                    const phoneRegex = /^[\+\s0-9\-\(\)]{10,20}$/im;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = "Invalid phone number";
                    }
                    const country = countrySelect.value;
                    if (country && countryCodes[country] && !value.startsWith(countryCodes[country])) {
                        isValid = false;
                        errorMessage = `Must start with ${countryCodes[country]}`;
                    }
                    break;

                case 'confirmPassword':
                    if (value !== passwordInput.value) {
                        isValid = false;
                        errorMessage = "Passwords do not match";
                    }
                    break;
            }
        }

        if (isValid) {
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                input.classList.remove('invalid');
                if (value) input.classList.add('valid');
                else input.classList.remove('valid');
            }
            if (errorSpan) {
                errorSpan.textContent = "";
                errorSpan.classList.remove('visible');
            }
        } else {
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                input.classList.add('invalid');
                input.classList.remove('valid');
            }
            if (errorSpan) {
                errorSpan.textContent = errorMessage;
                errorSpan.classList.add('visible');
            }
        }

        return isValid;
    }

    function checkFormValidity(triggerUI = false) {
        let isFormValid = true;

        const requiredInputs = Array.from(document.querySelectorAll('[required]'));

        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const groupName = input.name;
                const isChecked = document.querySelector(`input[name="${groupName}"]:checked`);
                if (!isChecked) isFormValid = false;
            } else if (input.type === 'checkbox') {
                if (!input.checked) isFormValid = false;
            } else {
                let localValid = true;
                if (!input.value) localValid = false;
                if (input.classList.contains('invalid')) localValid = false;

                if (triggerUI) {
                    if (!validateField(input)) localValid = false;
                } else {
                    if (!input.value || input.classList.contains('invalid')) localValid = false;
                    if (!validateField(input)) localValid = false;
                }

                if (!localValid) isFormValid = false;
            }
        });

        submitBtn.disabled = !isFormValid;
        return isFormValid;
    }

    function updatePasswordStrength() {
        const val = passwordInput.value;
        strengthContainer.classList.add('active');

        if (!val) {
            strengthContainer.classList.remove('active');
            strengthContainer.className = "strength-meter";
            return;
        }

        let strength = 0;
        if (val.length > 5) strength += 1;
        if (val.length > 7) strength += 1;
        if (/[A-Z]/.test(val)) strength += 1;
        if (/[0-9]/.test(val)) strength += 1;
        if (/[^A-Za-z0-9]/.test(val)) strength += 1;

        strengthContainer.className = "strength-meter active";

        if (strength <= 2) {
            strengthContainer.classList.add('strength-weak');
            strengthText.textContent = "Weak";
            strengthText.style.color = "var(--error-color)";
        } else if (strength <= 4) {
            strengthContainer.classList.add('strength-medium');
            strengthText.textContent = "Medium";
            strengthText.style.color = "var(--warning-color)";
        } else {
            strengthContainer.classList.add('strength-strong');
            strengthText.textContent = "Strong";
            strengthText.style.color = "var(--success-color)";
        }

        if (confirmPasswordInput.value) validateField(confirmPasswordInput);
    }
});
