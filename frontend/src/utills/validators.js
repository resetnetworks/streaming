export const validators = {
  // Email validation
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  emailError: "Please enter a valid email address.",

  // Password validation  
  password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value),
  passwordError: "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",

  // Name validation
  name: (value) => value.trim().length > 0,
  nameError: "Name is required.",

  // Password criteria checker (for real-time feedback)
  getPasswordCriteria: (password) => ({
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[\W_]/.test(password),
  }),

  // Generic field validator
  validateField: (fieldName, value) => {
    const validator = validators[fieldName];
    return validator ? validator(value) : true;
  },

  // Full form validation helper
  validateForm: (fields) => {
    const errors = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (!validators.validateField(key, value)) {
        errors[key] = validators[`${key}Error`] || `${key} is invalid`;
      }
    });
    return errors;
  }
};
