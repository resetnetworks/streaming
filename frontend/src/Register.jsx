import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword, TbUserSquareRounded } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa6";
import { assets } from "./assets/assets";
import { registerUser, getMyProfile } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const monthMap = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, isAuthenticated } = useSelector((state) => state.auth);
  const btnLoading = status === "loading";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const [formErrors, setFormErrors] = useState({});

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
    }

    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let finalDOB = undefined;
    if (dob.day && dob.month && dob.year) {
      finalDOB = `${dob.year}-${monthMap[dob.month]}-${dob.day.padStart(2, "0")}`;
    }

    dispatch(registerUser({ email, password, name, dob: finalDOB }))
      .unwrap()
      .then(() => {
        dispatch(getMyProfile());
      })
      .catch((err) => {
        toast.error(err || "Registration failed");
      });
  };

  const googleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };

  const facebookRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/facebook`;
  };

  return (
    <section className="w-full min-h-screen bg-image flex flex-col items-center">
      <img src={assets.reset_icon} className="w-10 py-3 block" alt="Reset Icon" />
      <div className="gradiant-line"></div>

      <div className="text-white sm:mt-auto mt-0 mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl my-6">
          <span className="text-blue-700">sign up</span>, it's free
        </h1>

        <form
          className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Name */}
          <div className="w-full mb-1">
            <label htmlFor="name" className="md:text-xl text-lg">
              name
            </label>
          </div>
          <div className="w-full relative">
            <TbUserSquareRounded className="inside-icon" />
            <input
              required
              type="text"
              id="name"
              className="input-login"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={btnLoading}
            />
          </div>
          {formErrors.name && (
            <p className="text-red-500 text-left w-full text-sm mt-1">{formErrors.name}</p>
          )}

          {/* Email */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={btnLoading}
            />
          </div>
          {formErrors.email && (
            <p className="text-red-500 text-left w-full text-sm mt-1">
              {formErrors.email}
            </p>
          )}

          {/* Password */}
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
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                setPasswordCriteria({
                  length: val.length >= 8,
                  lowercase: /[a-z]/.test(val),
                  uppercase: /[A-Z]/.test(val),
                  number: /\d/.test(val),
                  symbol: /[\W_]/.test(val),
                });
              }}
              placeholder="Create a strong password"
              disabled={btnLoading}
            />
            <div
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
          </div>

          {/* Password criteria live feedback */}
          <div className="text-sm mt-2 w-full flex flex-wrap gap-2">
            <span className={passwordCriteria.length ? "text-green-500" : "text-red-500"}>
              At least 8 characters
            </span>
            <span className={passwordCriteria.lowercase ? "text-green-500" : "text-red-500"}>
              • Lowercase
            </span>
            <span className={passwordCriteria.uppercase ? "text-green-500" : "text-red-500"}>
              • Uppercase
            </span>
            <span className={passwordCriteria.number ? "text-green-500" : "text-red-500"}>
              • Number
            </span>
            <span className={passwordCriteria.symbol ? "text-green-500" : "text-red-500"}>
              • Symbol
            </span>
          </div>
          {formErrors.password && (
            <p className="text-red-500 text-left w-full text-sm mt-1">
              {formErrors.password}
            </p>
          )}

          <div className="button-wrapper mt-9 shadow-sm shadow-black">
            <button
              className="custom-button"
              disabled={btnLoading}
              type="submit"
            >
              {btnLoading ? "Registering..." : "Create Account"}
            </button>
          </div>

          {/* Or Sign Up With */}
          <div className="flex items-center w-64 my-8">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="mx-4 text-white text-sm">Or Sign up With</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-around items-center md:w-64 w-52">
            <button
              onClick={googleRegister}
              type="button"
              disabled={btnLoading}
              className={`w-12 h-12 rounded-lg flex justify-center items-center bg-white ${
                btnLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.google_icon} alt="google_icon" className="w-6 h-6" />
            </button>
            <button
              onClick={facebookRegister}
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

        <p className={`mt-4 ${btnLoading ? "pointer-events-none opacity-50" : ""}`}>
          Already have an account?{" "}
          <a href="/login" className="text-blue-800 underline">
            Login
          </a>
        </p>
      </div>
    </section>
  );
};

export default Register;
