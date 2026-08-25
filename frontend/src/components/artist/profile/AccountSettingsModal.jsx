import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { accountSettingsApi } from "../../../api/accountSettingsApi";
import { FiX } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "sonner";

const AccountSettingsModal = ({ isOpen, onClose, initialMode = "email" }) => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // "email" or "password"
  const [emailForm, setEmailForm] = useState({ newEmail: "", otp: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [emailStep, setEmailStep] = useState(1); // 1: Request OTP, 2: Verify OTP
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes or mode changes
  React.useEffect(() => {
    setMode(initialMode);
    setEmailForm({ newEmail: "", otp: "" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    setEmailStep(1);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const requestEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailForm.newEmail) return;
    setIsLoading(true);
    try {
      const res = await accountSettingsApi.initiateEmailChange({
        email: user?.email,
        newEmail: emailForm.newEmail,
      });
      toast.success(res.message);
      setEmailStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate email change.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailForm.otp) return;
    setIsLoading(true);
    try {
      const res = await accountSettingsApi.verifyEmailChange({
        email: user?.email,
        otp: emailForm.otp,
      });
      toast.success(res.message);
      setTimeout(() => {
        dispatch({ type: 'auth/logout/fulfilled' });
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await accountSettingsApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });
      toast.success(res.message);
      setTimeout(() => {
        dispatch({ type: 'auth/logout/fulfilled' });
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div 
        className="w-full max-w-[420px] rounded-[24px] p-8 flex flex-col relative animate-fade-in-up"
        style={{
          background: 'linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)',
          boxShadow: `
          12px 12px 40px rgba(0,0,0,0.7),
          -8px -8px 30px rgba(59,130,246,0.08),
          inset 1px 1px 1px rgba(255,255,255,0.05),
          0 0 0 1px rgba(59,130,246,0.1)
        `,
        }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === "email" ? "Change Email" : "Change Password"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors absolute top-6 right-6"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="w-full">
          {mode === "email" ? (
            emailStep === 1 ? (
              <form onSubmit={requestEmailOtp}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                    Current Email
                  </label>
                  <div className="w-full bg-[#0A0A23]/50 border border-slate-600/50 rounded-lg py-3 px-4 text-slate-500 cursor-not-allowed">
                    {user?.email || "No email available"}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                    New Email
                  </label>
                  <input
                    type="email"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={handleEmailChange}
                    required
                    className="w-full bg-[#0A0A23] border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter new email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !emailForm.newEmail}
                  className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                    boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                  }}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyEmailOtp}>
                <div className="mb-6">
                  <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm">
                      We've sent a 6-digit code to <br/><strong>{emailForm.newEmail}</strong>
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider text-center">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={emailForm.otp}
                    onChange={handleEmailChange}
                    required
                    className="w-full bg-[#0A0A23] border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors tracking-widest text-center text-xl"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || !emailForm.otp}
                    className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                      boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                    }}
                  >
                    {isLoading ? "Verifying..." : "Verify & Change Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailStep(1);
                    }}
                    className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={changePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full bg-[#0A0A23] border border-slate-600 rounded-lg py-3 px-4 pr-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter current password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full bg-[#0A0A23] border border-slate-600 rounded-lg py-3 px-4 pr-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter new password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full bg-[#0A0A23] border border-slate-600 rounded-lg py-3 px-4 pr-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Confirm new password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword}
                className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50 mt-2"
                style={{
                  background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                  boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                }}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
