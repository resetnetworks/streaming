import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { assets } from "../assets/assets";
import IconHeader from "../components/user/IconHeader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

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
        navigate("/"); // Optional: redirect after login
      })
      .catch((err) => {
        if (err?.response?.status === 429) {
          toast.error("Too many requests. Please wait a few seconds.");
        } else {
          toast.error(err?.message || "Login failed. Please check credentials.");
        }
      });
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };

  const facebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/facebook`;
  };

  return (
    <>
    <Helmet>
    <title>Login to RESET Music | Stream Ambient & Experimental Music</title>
    <meta name="robots" content="index, follow" />
    <meta name="description" content="Access your RESET account to stream ambient, instrumental, and experimental music. Log in to manage subscriptions, liked songs, and more." />
    </Helmet>
    <section className="w-full min-h-screen bg-image flex flex-col items-center">
      <IconHeader />

      <div className="text-white sm:mt-auto mt-10 mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl mb-6">
          <span className="text-blue-700">login</span> to reset
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
          <div className="flex justify-around items-center md:w-64 w-52">
            <button
              onClick={googleLogin}
              type="button"
              disabled={btnLoading}
              className={`w-12 h-12 rounded-lg flex justify-center items-center bg-white ${
                btnLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.google_icon} alt="google_icon" className="w-6 h-6" />
            </button>
            <button
              onClick={facebookLogin}
              type="button"
              disabled={btnLoading}
              className={`w-12 h-12 rounded-lg flex justify-center items-center bg-white ${
                btnLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.facebook_icon} alt="facebook_icon" className="w-6 h-6" />
            </button>
            <button
              type="button"
              disabled={btnLoading}
              className={`w-12 h-12 rounded-lg flex justify-center items-center bg-white ${
                btnLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.apple_icon} alt="apple_icon" className="w-6 h-6" />
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
    </>
  );
};

export default Login;
