// src/components/artist/register/ArtistBasicInfo.jsx
import React, { useState } from 'react';
import { MdOutlineEmail, MdPerson } from 'react-icons/md';
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { validators } from '../../../utills/validators';
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from '../../../features/auth/authSlice';
import { updateApplicationFormData } from '../../../features/artistApplications/artistApplicationSlice';

const ArtistBasicInfo = ({ onRegistrationSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  // same validation as normal Register
  const validate = () =>
    validators.validateForm({
      name: formData.firstName,
      email: formData.email,
      password: formData.password,
    });

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, password: val }));
    setPasswordCriteria(validators.getPasswordCriteria(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      
      // Store basic user info in artist application Redux store
      dispatch(updateApplicationFormData({
        firstName: formData.firstName,
        lastName: '', // Add if you have last name field
        email: formData.email,
      }));
      
      // Call parent callback with user data
      if (onRegistrationSuccess) {
        onRegistrationSuccess(userData);
      }
      
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="text-white sm:mt-auto mb-auto flex flex-col justify-around items-center">
      <form
        className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f] mt-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Artist Name Field */}
        <div className="w-full mb-1">
          <label htmlFor="firstName" className="md:text-xl text-lg">
            artist name
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
            placeholder="Enter your artist name"
            disabled={loading}
          />
        </div>
        {formErrors.name && (
          <p className="text-red-500 text-left w-full text-sm mt-1">
            {formErrors.name}
          </p>
        )}

        {/* Email Field */}
        <div className="w-full mt-5 mb-1">
          <label htmlFor="email" className="md:text-xl text-lg">
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
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>
        {formErrors.email && (
          <p className="text-red-500 text-left w-full text-sm mt-1">
            {formErrors.email}
          </p>
        )}

        {/* Password Field */}
        <div className="w-full mt-5 mb-1">
          <label htmlFor="password" className="md:text-xl text-lg">
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

        {/* Password criteria */}
        <div className="text-sm mt-2 w-full flex flex-wrap gap-2">
          <span
            className={
              passwordCriteria.length ? "text-green-500" : "text-red-500"
            }
          >
            At least 8 characters
          </span>
          <span
            className={
              passwordCriteria.lowercase ? "text-green-500" : "text-red-500"
            }
          >
            • Lowercase
          </span>
          <span
            className={
              passwordCriteria.uppercase ? "text-green-500" : "text-red-500"
            }
          >
            • Uppercase
          </span>
          <span
            className={
              passwordCriteria.number ? "text-green-500" : "text-red-500"
            }
          >
            • Number
          </span>
          <span
            className={
              passwordCriteria.symbol ? "text-green-500" : "text-red-500"
            }
          >
            • Symbol
          </span>
        </div>
        {formErrors.password && (
          <p className="text-red-500 text-left w-full text-sm mt-1">
            {formErrors.password}
          </p>
        )}

        <div className="button-wrapper mt-6 shadow-sm shadow-black">
          <button
            className="custom-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Artist Account"}
          </button>
        </div>
      </form>

      <p
        className={`mt-4 text-center px-4 ${
          loading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Already have an account?{" "}
        <a
          href="/login"
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
        >
          Sign In
        </a>
      </p>
    </div>
  );
};

export default ArtistBasicInfo;