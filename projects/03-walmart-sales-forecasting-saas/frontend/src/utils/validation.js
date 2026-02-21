/**
 * Form Validation Utilities
 * Reusable validation functions for forms
 */

// Email validation
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Please enter a valid email address';
    return null;
};

// Password validation
export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character';
    return null;
};

// Password strength calculator
export const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'gray' };

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Complexity bonus
    if (password.length >= 16 && score >= 4) score++;

    const strengthMap = {
        0: { label: 'Very Weak', color: 'red' },
        1: { label: 'Weak', color: 'orange' },
        2: { label: 'Fair', color: 'yellow' },
        3: { label: 'Fair', color: 'yellow' },
        4: { label: 'Good', color: 'blue' },
        5: { label: 'Strong', color: 'green' },
        6: { label: 'Very Strong', color: 'green' },
        7: { label: 'Excellent', color: 'green' }
    };

    return { score, ...strengthMap[Math.min(score, 7)] };
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
    }
    return null;
};

// Name validation
export const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name contains invalid characters';
    return null;
};

// Phone validation (basic)
export const validatePhone = (phone) => {
    const re = /^[\d\s()+-]+$/;
    if (!phone) return 'Phone number is required';
    if (!re.test(phone)) return 'Please enter a valid phone number';
    if (phone.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return null;
};

// URL validation
export const validateURL = (url) => {
    try {
        new URL(url);
        return null;
    } catch {
        return 'Please enter a valid URL';
    }
};

// Number range validation
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (num > max) return `${fieldName} must not exceed ${max}`;
    return null;
};

// Form validation helper
export const validateForm = (values, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const validators = Array.isArray(rules[field]) ? rules[field] : [rules[field]];

        for (const validator of validators) {
            const error = validator(values[field]);
            if (error) {
                errors[field] = error;
                break;
            }
        }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
};

export default {
    validateEmail,
    validatePassword,
    validateRequired,
    validateName,
    validatePhone,
    validateURL,
    validateNumberRange,
    validateForm,
    getPasswordStrength
};
