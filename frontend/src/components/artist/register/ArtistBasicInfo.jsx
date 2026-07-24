// src/components/artist/register/ArtistBasicInfo.jsx
import React, { useState } from 'react';
import { MdOutlineEmail, MdPerson } from 'react-icons/md';
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { validators } from '../../../utills/validators';
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from '../../../features/auth/authSlice';
import { ArtistApplicationFormContext } from '../../../pages/artist/ArtistRegister';

const ArtistBasicInfo = ({ onRegistrationSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const { updateApplicationFormData } = React.useContext(ArtistApplicationFormContext);

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Track which fields the user has interacted with (touched/blurred)
  const [touched, setTouched] = useState({
    firstName: false,
    email: false,
    password: false,
  });

  // Password criteria only show after user starts typing in password field
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  // Validate all fields and return errors object
  const validate = (data = formData) =>
    validators.validateForm({
      name: data.firstName,
      email: data.email,
      password: data.password,
    });

  // Validate a single field on blur
  const validateField = (field) => {
    const allErrors = validate();
    // Map field names to validator keys
    const keyMap = { firstName: 'name', email: 'email', password: 'password' };
    const key = keyMap[field];

    setFormErrors(prev => ({
      ...prev,
      // If error exists for this field, set it; otherwise clear it
      [key]: allErrors[key] || undefined,
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // If field was already touched (had an error), re-validate on change for instant feedback
    if (touched[field]) {
      const allErrors = validate(updatedData);
      const keyMap = { firstName: 'name', email: 'email', password: 'password' };
      const key = keyMap[field];
      setFormErrors(prev => ({
        ...prev,
        [key]: allErrors[key] || undefined,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;

    // Mark password as touched as soon as user starts typing
    if (!passwordTouched) setPasswordTouched(true);

    setFormData(prev => ({ ...prev, password: val }));
    setPasswordCriteria(validators.getPasswordCriteria(val));

    // If field was already blurred, re-validate on change
    if (touched.password) {
      const allErrors = validate({ ...formData, password: val });
      setFormErrors(prev => ({
        ...prev,
        password: allErrors.password || undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // On submit, mark all fields as touched and show all errors
    setTouched({ firstName: true, email: true, password: true });
    setPasswordTouched(true);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      const userData = await dispatch(
        registerUser({
          name: formData.firstName,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      toast.success("Account created! Continuing to artist application...");

      // Store basic user info in artist application Context
      updateApplicationFormData({
        firstName: formData.firstName,
        lastName: '',
        email: formData.email,
      });

      // Call parent callback with user data
      if (onRegistrationSuccess) {
        onRegistrationSuccess(userData);
      }

    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  return (
    <div className="text-white sm:mt-auto mb-auto flex flex-col justify-around items-center w-full max-w-[650px] mx-auto mt-6">
      <form
        className="w-full rounded-[24px] p-8 mt-4 flex flex-col items-center"
        style={{
          background: 'linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)',
          boxShadow: `
            12px 12px 40px rgba(0,0,0,0.7),
            -8px -8px 30px rgba(59,130,246,0.08),
            inset 1px 1px 1px rgba(255,255,255,0.05),
            0 0 0 1px rgba(59,130,246,0.1)
          `,
        }}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Artist Name Field */}
        <div className="w-full mb-2">
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            full name
          </label>
        </div>
        <div className="w-full relative">
          <MdPerson className="inside-icon" />
          <input
            required
            type="text"
            id="firstName"
            className="input-login"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>
        {/* Show name error only after field is touched/blurred */}
        {touched.firstName && formErrors.name && (
          <p className="text-red-500 text-left w-full text-xs mt-1">
            {formErrors.name}
          </p>
        )}

        {/* Email Field */}
        <div className="w-full mt-5 mb-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            email
          </label>
        </div>
        <div className="w-full relative">
          <MdOutlineEmail className="inside-icon" />
          <input
            required
            type="email"
            id="email"
            className="input-login"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>
        {/* Show email error only after field is touched/blurred */}
        {touched.email && formErrors.email && (
          <p className="text-red-500 text-left w-full text-xs mt-1">
            {formErrors.email}
          </p>
        )}

        {/* Password Field */}
        <div className="w-full mt-5 mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
            password
          </label>
        </div>
        <div className="w-full relative">
          <TbLockPassword className="inside-icon" />
          <input
            required
            type={showPassword ? "text" : "password"}
            id="password"
            className="input-login"
            value={formData.password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            placeholder="Create a strong password"
            disabled={loading}
          />
          <div
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
            role="button"
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </div>
        </div>

        {/* Password criteria — only shown after user starts typing in password field */}
        {passwordTouched && (
          <div className="text-xs mt-3 w-full flex flex-wrap gap-2 text-slate-400">
            <span className={passwordCriteria.length ? "text-green-500" : (touched.password && formErrors.password ? "text-red-400" : "text-slate-400")}>
              At least 8 characters
            </span>
            <span className={passwordCriteria.lowercase ? "text-green-500" : (touched.password && formErrors.password ? "text-red-400" : "text-slate-400")}>
              • Lowercase
            </span>
            <span className={passwordCriteria.uppercase ? "text-green-500" : (touched.password && formErrors.password ? "text-red-400" : "text-slate-400")}>
              • Uppercase
            </span>
            <span className={passwordCriteria.number ? "text-green-500" : (touched.password && formErrors.password ? "text-red-400" : "text-slate-400")}>
              • Number
            </span>
            <span className={passwordCriteria.symbol ? "text-green-500" : (touched.password && formErrors.password ? "text-red-400" : "text-slate-400")}>
              • Symbol
            </span>
          </div>
        )}

        <div className="w-full max-w-[380px] mt-9 flex justify-center">
          <button
            className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
              boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Artist Account"}
          </button>
        </div>
      </form>

      <p
        className={`mt-6 text-center text-slate-400 ${loading ? "pointer-events-none opacity-50" : ""
          }`}
      >
        Already have an account?{" "}
        <a
          href="/login"
          className="no-underline hover:underline hover:text-white style={{ color: '#4DB3FF' }} transition-colors duration-200"
          style={{ color: '#4DB3FF' }}
        >
          Sign In
        </a>
      </p>
    </div>
  );
};

export default ArtistBasicInfo;