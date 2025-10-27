// src/pages/Login.js
import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { assets } from "../../assets/assets";
import IconHeader from "../../components/user/IconHeader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";
import { toast } from "sonner";
import BackgroundWrapper from "../../components/BackgroundWrapper";
import PageSEO from "../../components/PageSeo/PageSEO";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, isAuthenticated, user } = useSelector((state) => state.auth);
  const btnLoading = status === "loading";

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        toast.success("Login successful");
        navigate("/home");
      })
      .catch((err) => {
        if (err?.response?.status === 429) {
          toast.error("Too many requests. Please wait a few minuts.");
        } else {
          toast.error(err);
        }
      });
  };

  // 🔥 UPDATED: Social login functions with correct API routes
  const googleLogin = () => {
    
    // Clear any existing auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("justRegistered");
    localStorage.removeItem("registrationTime");
    
    toast.loading("Redirecting to Google...", { duration: 3000 });
    
    // 🔥 Updated URL to match your backend routes
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };


  return (
    <>
    <PageSEO
  title="Login - Reset Music Streaming | Sign In Account"
description="Sign in to your Reset Music streaming account to access playlists, subscriptions & stream ambient, instrumental music. Login with email."
  canonicalUrl="https://musicreset.com/login"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login - Reset Music",
    "description": "User login page for Reset Music streaming platform",
    "url": "https://musicreset.com/login",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "Reset Music Login",
      "applicationCategory": "Music Streaming",
      "operatingSystem": "Web Browser",
      "featureList": [
        "Access personal playlists",
        "Manage artist subscriptions",
        "Stream music library",
        "Personalized recommendations"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Reset Music",
      "url": "https://musicreset.com"
    },
    "potentialAction": {
      "@type": "LoginAction",
      "target": "https://musicreset.com/login",
      "name": "Sign In to Reset Music Account"
    }
  }}
  noIndex={true}
/>

      <BackgroundWrapper>
      <section className="w-full min-h-screen flex flex-col items-center">
        <IconHeader />

        <div className="text-white sm:mt-auto mt-10 mb-auto flex flex-col justify-around items-center">
          <h1 className="text-4xl mb-6">
            <span className="text-blue-700">login</span> to musicreset
          </h1>

          <form
            className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
            onSubmit={handleLogin}
          >
            {/* Email Field */}
            <div className="w-full mb-1">
              <label htmlFor="email" className="md:text-xl text-lg">email</label>
            </div>
            <div className="w-full relative">
              <MdOutlineEmail className="inside-icon" />
              <input
                required
                type="email"
                placeholder="Enter your email"
                className="input-login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={btnLoading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={btnLoading}
              />
              <div
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </div>
            </div>

            {/* Forgot Password */}
            <a
              href="/forgot-password"
              className={`hover:text-blue-800 ml-auto mt-1 text-base sm:text-xl ${
                btnLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Forgot Password?
            </a>

            {/* Login Button */}
            <div className="button-wrapper mt-9 cursor-pointer shadow-sm shadow-black">
              <button className="custom-button" disabled={btnLoading}>
                {btnLoading ? "Logging in..." : "Login"}
              </button>
            </div>

            {/* Or Sign In With */}
            <div className="flex items-center w-64 my-8">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="mx-4 text-white text-sm">Or Sign in With</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            {/* Social Icons */}
            <div className="flex justify-around items-center w-52">
              <button
                onClick={googleLogin}
                type="button"
                disabled={btnLoading}
                className={`w-full h-12 rounded-lg flex justify-center items-center bg-white transition-all hover:scale-105 ${
                  btnLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <img src={assets.google_icon} alt="google_icon" className="w-8 h-8" />
              </button>
            
            </div>
          </form>

          {/* Register Link */}
          <p className={`mt-4 ${btnLoading ? "pointer-events-none opacity-50" : ""}`}>
            Don't have an account?{" "}
            <a href="/register" className="text-blue-800 underline">
              Create Account
            </a>
          </p>
        </div>
      </section>
      </BackgroundWrapper>
    </>
  );
};

export default Login;
