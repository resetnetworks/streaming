import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { assets } from "../assets/assets";
import IconHeader from "../components/IconHeader";
import { UserData } from "../context/User";
import { useNavigate } from "react-router-dom";
import { SongData } from "../context/Song";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser, btnLoading } = UserData();
  const { fetchSong } = SongData();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    loginUser(email, password, navigate, fetchSong);
  };

  return (
    <section className="w-full min-h-screen bg-image flex flex-col items-center">
      <IconHeader />

      <div className="text-white mt-auto mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl mb-6">
          <span className="text-blue-700">login</span> to reset
        </h1>

        <form
          className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
          onSubmit={handleLogin}
        >
          {/* Email Field */}
          <div className="w-full mb-1">
            <label htmlFor="email" className="md:text-xl text-lg">
              email
            </label>
          </div>
          <div className="w-full relative">
            <MdOutlineEmail className="inside-icon" />
            <input
              required
              type="email"
              className="input-login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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
              className="input-login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            href="#"
            className="hover:text-blue-800 ml-auto mt-1 text-base sm:text-xl"
          >
            Forgot Password?
          </a>

          {/* Login Button */}
          <div className="button-wrapper mt-9 shadow-sm shadow-black">
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
            <a
              href="#"
              className="w-12 h-12 bg-white rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.google_icon}
                alt="google_icon"
                className="w-6 h-6"
              />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.facebook_icon}
                alt="facebook_icon"
                className="w-6 h-6"
              />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.apple_icon}
                alt="apple_icon"
                className="w-6 h-6"
              />
            </a>
          </div>
        </form>

        {/* Create Account Link */}
        <p className="mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-800 underline">
            Create Account
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;
