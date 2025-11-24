import React, { useState } from 'react';
import { MdOutlineEmail, MdPerson } from 'react-icons/md';
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ArtistBasicInfo = ({ formData, updateFormData, nextStep }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const handleTermsChange = (e) => {
    setAcceptedTerms(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert("All fields are required");
      return;
    }
    if (!acceptedTerms) {
      alert("Please accept the Terms and Conditions to continue");
      return;
    }
    nextStep();
  };

  return (
    <div className="text-white sm:mt-auto mb-auto flex flex-col justify-around items-center">
      <form
        className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f] mt-6"
        onSubmit={handleSubmit}
      >
        {/* Artist First Name Field */}
        <div className="w-full mb-1">
          <label htmlFor="firstName" className="md:text-xl text-lg">artist first name</label>
        </div>
        <div className="w-full relative">
          <MdPerson className="inside-icon" />
          <input
            required
            type="text"
            placeholder="Enter your first name"
            className="input-login"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>

        {/* Artist Last Name Field */}
        <div className="w-full mt-5 mb-1">
          <label htmlFor="lastName" className="md:text-xl text-lg">artist last name</label>
        </div>
        <div className="w-full relative">
          <MdPerson className="inside-icon" />
          <input
            required
            type="text"
            placeholder="Enter your last name"
            className="input-login"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>

        {/* Email Field */}
        <div className="w-full mt-5 mb-1">
          <label htmlFor="email" className="md:text-xl text-lg">email match paypal</label>
        </div>
        <div className="w-full relative">
          <MdOutlineEmail className="inside-icon" />
          <input
            required
            type="email"
            placeholder="Enter your email"
            className="input-login"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div className="w-full mt-5 mb-1">
          <label htmlFor="password" className="md:text-xl text-lg">password</label>
        </div>
        <div className="w-full relative">
          <TbLockPassword className="inside-icon" />
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="input-login"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
          <div
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="w-full mt-6 mb-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
              I agree to the{' '}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </label>
          </div>
        </div>

        {/* Continue Button */}
        <div className="button-wrapper mt-6 cursor-pointer shadow-sm shadow-black">
          <button 
            className={`custom-button ${!acceptedTerms ? 'opacity-50 cursor-not-allowed' : ''}`} 
            type="submit"
            disabled={!acceptedTerms}
          >
            Continue
          </button>
        </div>
      </form>

      {/* Login Link */}
      <p className="mt-4 text-center px-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">
          Sign In
        </a>
      </p>
    </div>
  );
};

export default ArtistBasicInfo;