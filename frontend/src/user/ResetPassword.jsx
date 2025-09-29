import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import IconHeader from "../components/user/IconHeader";
import BackgroundWrapper from "../components/BackgroundWrapper";
import PageSEO from "../components/SEO/PageSEO";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/reset-password/${token}`,
        { password }
      );
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <PageSEO
  title="Reset Password | Reset Music - Secure Account Recovery"
  description="Reset your Reset Music account password securely. Create a new password to regain access to your personalized music streaming experience."
  url={window.location.href}
/>
    <BackgroundWrapper>
    <section className="w-full min-h-screen flex flex-col items-center">
      <IconHeader />

      <div className="text-white mt-auto mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl mb-6 text-center">
          <span className="text-blue-700">reset</span> your password
        </h1>

        <form
          className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
          onSubmit={handleSubmit}
        >
          {/* New Password */}
          <div className="w-full mb-1">
            <label htmlFor="password" className="md:text-xl text-lg">new password</label>
          </div>
          <div className="w-full relative">
            <TbLockPassword className="inside-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              className="input-login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your new password"
            />
            <div
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="w-full mt-5 mb-1">
            <label htmlFor="confirmPassword" className="md:text-xl text-lg">confirm password</label>
          </div>
          <div className="w-full relative">
            <TbLockPassword className="inside-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              className="input-login"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Re-enter your password"
            />
          </div>

          {/* Submit Button */}
          <div className="button-wrapper mt-9 shadow-sm shadow-black">
            <button className="custom-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          {/* Back to Login */}
          <p className={`mt-4 ${loading ? "pointer-events-none opacity-50" : ""}`}>
            Go back to{" "}
            <a href="/login" className="text-blue-800 underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </section>
    </BackgroundWrapper>
    </>
  );
};

export default ResetPassword;
