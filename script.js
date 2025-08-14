// DOM elements
const form = document.getElementById('websiteForm');
const steps = document.querySelectorAll('.form-step');
const progressFill = document.querySelector('.progress-fill');
const nextBtn = document.querySelector('.next-step');
const prevBtn = document.querySelector('.prev-step');
const submitBtn = document.querySelector('.submit-form');

let currentStep = 0;
const totalSteps = steps.length;

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    updateFormDisplay();
    setupFormValidation();
    setupSmoothScrolling();
    setupHeaderScroll();
    setupFormSubmission();
    setupFileUpload();
    enhanceDropdowns();
});

// Form step navigation
function updateFormDisplay() {
    // Hide all steps
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === currentStep) {
            step.classList.add('active');
        }
    });

    // Update progress bar
    const progress = ((currentStep + 1) / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;

    // Update navigation buttons
    prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-flex';
    
    if (currentStep === totalSteps - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }

    // Add entrance animation
    const activeStep = steps[currentStep];
    activeStep.style.opacity = '0';
    activeStep.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        activeStep.style.transition = 'all 0.5s ease';
        activeStep.style.opacity = '1';
        activeStep.style.transform = 'translateY(0)';
    }, 50);
}

// Navigation event listeners
nextBtn.addEventListener('click', function() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateFormDisplay();
        }
    }
});

prevBtn.addEventListener('click', function() {
    if (currentStep > 0) {
        currentStep--;
        updateFormDisplay();
    }
});

// Form validation
function validateCurrentStep() {
    const currentStepElement = steps[currentStep];
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        const errorElement = field.nextElementSibling?.classList.contains('error-message') 
            ? field.nextElementSibling 
            : null;
        
        // Remove existing error message
        if (errorElement) {
            errorElement.remove();
        }

        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        } else {
            removeFieldError(field);
        }
    });

    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#ff6b6b';
    field.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff6b6b';
    errorElement.style.fontSize = '0.9rem';
    errorElement.style.marginTop = '0.5rem';
    errorElement.style.animation = 'fadeIn 0.3s ease';
    
    field.parentElement.appendChild(errorElement);
}

function removeFieldError(field) {
    field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    field.style.boxShadow = 'none';
    
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Setup form validation
function setupFormValidation() {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                showFieldError(this, 'This field is required');
            } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
                showFieldError(this, 'Please enter a valid email address');
            } else {
                removeFieldError(this);
            }
        });

        input.addEventListener('input', function() {
            removeFieldError(this);
        });

        // Add focus effects
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
        });

        input.addEventListener('blur', function() {
            if (!this.classList.contains('error')) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                this.style.boxShadow = 'none';
            }
        });
    });
}

// Form submission
function setupFormSubmission() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        form.classList.add('form-loading');

        // Collect form data
        const formData = new FormData(form);
        
        // Add timestamp
        formData.append('submission_date', new Date().toISOString());
        
        // Submit to getform.io
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                showSuccessMessage();
            } else {
                throw new Error('Submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage();
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Project Request';
            submitBtn.disabled = false;
            form.classList.remove('form-loading');
        });
    });
}

function showSuccessMessage() {
    // Hide form and show success message
    const formContainer = document.querySelector('.website-form');
    
    formContainer.innerHTML = `
        <div class="success-message show">
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #43e97b; margin-bottom: 1rem; display: block;"></i>
                <h3 style="color: #43e97b; margin-bottom: 1rem; font-size: 1.8rem;">Thank You!</h3>
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 1.1rem; margin-bottom: 1.5rem;">
                    Your project request has been submitted successfully. Our team will review your information and get back to you within 24 hours.
                </p>
                <div style="background: rgba(67, 233, 123, 0.1); border: 1px solid #43e97b; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
                    <p style="color: #43e97b; margin: 0; font-weight: 500;">
                        <i class="fas fa-info-circle"></i>
                        What's next? We'll analyze your requirements and prepare a custom proposal for your project.
                    </p>
                </div>
                <a href="#contact" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-phone"></i>
                    Contact Us Directly
                </a>
            </div>
        </div>
    `;
    
    // Scroll to success message
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorMessage() {
    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.style.background = 'rgba(255, 107, 107, 0.2)';
    errorDiv.style.borderColor = '#ff6b6b';
    errorDiv.style.color = '#ff6b6b';
    errorDiv.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            There was an error submitting your form. Please try again or contact us directly.
        </div>
    `;
    
    form.appendChild(errorDiv);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Enhanced checkbox and radio interactions
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const radios = document.querySelectorAll('input[type="radio"]');
    
    [...checkboxes, ...radios].forEach(input => {
        input.addEventListener('change', function() {
            const label = this.nextElementSibling;
            
            if (this.type === 'radio') {
                // Remove active state from other radio buttons in the same group
                const sameGroupRadios = document.querySelectorAll(`input[name="${this.name}"]`);
                sameGroupRadios.forEach(radio => {
                    if (radio !== this) {
                        radio.nextElementSibling.style.transform = 'scale(1)';
                    }
                });
            }
            
            if (this.checked) {
                label.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    label.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
});

// Form progress tracking
let formStartTime = Date.now();
let stepTimes = [];

function trackStepTime() {
    const currentTime = Date.now();
    stepTimes.push({
        step: currentStep,
        timeSpent: currentTime - formStartTime
    });
    formStartTime = currentTime;
}

// Track step changes
const originalUpdateFormDisplay = updateFormDisplay;
updateFormDisplay = function() {
    trackStepTime();
    originalUpdateFormDisplay();
};

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
            nextBtn.click();
        } else {
            submitBtn.click();
        }
    }
    
    if (e.key === 'Escape') {
        // Could add a "Are you sure you want to leave?" modal here
    }
});

// File upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('companyLogo');
    const uploadArea = document.querySelector('.file-upload-area');
    const uploadContent = document.querySelector('.file-upload-content');
    const filePreview = document.querySelector('.file-preview');
    const logoPreview = document.querySelector('.logo-preview');
    const removeBtn = document.querySelector('.remove-file');

    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Remove file handler
    removeBtn.addEventListener('click', removeFile);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            validateAndPreviewFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleFileDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            validateAndPreviewFile(file);
            
            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        }
    }

    function validateAndPreviewFile(file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            showFileError('Please upload a valid image file (JPG, PNG, SVG)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showFileError('File size must be less than 5MB');
            return;
        }

        // Preview the file
        const reader = new FileReader();
        reader.onload = function(e) {
            logoPreview.src = e.target.result;
            uploadContent.style.display = 'none';
            filePreview.style.display = 'flex';
            
            // Add success styling
            uploadArea.style.borderColor = '#43e97b';
            uploadArea.style.background = 'rgba(67, 233, 123, 0.1)';
        };
        reader.readAsDataURL(file);
    }

    function removeFile() {
        fileInput.value = '';
        logoPreview.src = '';
        uploadContent.style.display = 'block';
        filePreview.style.display = 'none';
        
        // Reset styling
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.05)';
        
        // Remove any error messages
        const existingError = uploadArea.parentElement.querySelector('.file-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function showFileError(message) {
        // Remove existing error
        const existingError = uploadArea.parentElement.querySelector('.file-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 6px;
            animation: fadeIn 0.3s ease;
        `;
        
        uploadArea.parentElement.appendChild(errorDiv);
        
        // Add error styling to upload area
        uploadArea.style.borderColor = '#ff6b6b';
        uploadArea.style.background = 'rgba(255, 107, 107, 0.1)';
        
        // Reset file input
        fileInput.value = '';
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
                uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                uploadArea.style.background = 'rgba(255, 255, 255, 0.05)';
            }
        }, 5000);
    }
}

// Enhanced dropdown functionality
function enhanceDropdowns() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Add enhanced styling on interaction
        select.addEventListener('focus', function() {
            this.style.background = 'rgba(255, 255, 255, 0.15)';
            this.style.backdropFilter = 'blur(25px)';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)';
        });
        
        select.addEventListener('blur', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.backdropFilter = 'blur(10px)';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Add selection effect
        select.addEventListener('change', function() {
            if (this.value) {
                this.style.background = 'linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
                this.style.borderColor = '#667eea';
                this.style.color = 'white';
                
                // Add a subtle glow effect
                setTimeout(() => {
                    this.style.background = 'rgba(255, 255, 255, 0.15)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }, 300);
            }
        });
        
        // Add hover effects
        select.addEventListener('mouseenter', function() {
            if (!this.matches(':focus')) {
                this.style.background = 'rgba(255, 255, 255, 0.12)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }
        });
        
        select.addEventListener('mouseleave', function() {
            if (!this.matches(':focus')) {
                this.style.background = 'rgba(255, 255, 255, 0.1)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
    });
}

// Auto-save form data to localStorage
function saveFormData() {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (like checkboxes)
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    
    localStorage.setItem('deepcoders_form_data', JSON.stringify(data));
}

function loadFormData() {
    const savedData = localStorage.getItem('deepcoders_form_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const specificField = form.querySelector(`[name="${key}"][value="${value}"]`);
                            if (specificField) specificField.checked = true;
                        });
                    } else {
                        const specificField = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (specificField) specificField.checked = true;
                    }
                } else {
                    field.value = data[key];
                }
            }
        });
    }
}

// Auto-save on form change
form.addEventListener('input', debounce(saveFormData, 1000));
form.addEventListener('change', saveFormData);

// Load saved data on page load
document.addEventListener('DOMContentLoaded', loadFormData);

// Clear saved data on successful submission
const originalShowSuccessMessage = showSuccessMessage;
showSuccessMessage = function() {
    localStorage.removeItem('deepcoders_form_data');
    originalShowSuccessMessage();
};

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// Mobile menu toggle
function createMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    // Create hamburger menu if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.display = 'none';
        
        navbar.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
                this.style.background = 'rgba(255, 107, 107, 0.2)';
            } else {
                icon.className = 'fas fa-bars';
                this.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
        
        // Close menu when clicking on nav links
        navLinks.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                navLinks.classList.remove('active');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
                toggleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target)) {
                navLinks.classList.remove('active');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
                toggleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    }
    
    // Show/hide toggle button based on screen size
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768) {
        toggleBtn.style.display = 'block';
    } else {
        toggleBtn.style.display = 'none';
        navLinks.classList.remove('active');
        navLinks.style.display = 'flex';
    }
}

window.addEventListener('resize', createMobileMenu);
document.addEventListener('DOMContentLoaded', createMobileMenu);
