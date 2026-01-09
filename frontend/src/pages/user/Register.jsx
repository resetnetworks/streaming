// src/pages/Register.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword, TbUserSquareRounded } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { assets } from "../../assets/assets";
import { registerUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "../../utills/axiosInstance";
import BackgroundWrapper from "../../components/BackgroundWrapper";
import PageSEO from "../../components/PageSeo/PageSEO";
import { validators } from "../../utills/validators";
import { CircleGeometry } from "three/src/Three.Core.js";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [justRegistered, setJustRegistered] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    if (justRegistered && user) {
      const timer = setTimeout(async () => {
        try {
          localStorage.setItem("justRegistered", "true");
          localStorage.setItem("registrationTime", Date.now().toString());
          await axios.get("/users/me", { withCredentials: true });
          toast.success(`Welcome ${user.name}! Please select your favorite genres.`);
          navigate("/genres");
          setJustRegistered(false);
        } catch (error) {
          toast.error("Registration successful but please login again");
          navigate("/login");
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [justRegistered, user, navigate]);

  // 🔥 SIMPLIFIED VALIDATION using utils
  const validate = () => validators.validateForm({ email, password, name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      const result = await dispatch(registerUser({ email, password, name })).unwrap();
      setJustRegistered(true);
    } catch (err) {
      console.log(err)
      toast.error(err || "Registration failed");
    }
  };

  // 🔥 SIMPLIFIED PASSWORD HANDLER using utils
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordCriteria(validators.getPasswordCriteria(val));
  };

  const googleRegister = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("justRegistered");
    localStorage.removeItem("registrationTime");
    toast.loading("Redirecting to Google...", { duration: 3000 });
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };

  return (
    <>
      <PageSEO
        title="Create Account - Reset Music Streaming | Sign Up Free"
        description="Join Reset Music streaming & create your free account to stream ambient, instrumental & experimental music. Sign up with email to start."
        canonicalUrl="https://musicreset.com/register"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Create Account - Reset Music",
          "description": "User registration page for Reset Music streaming platform",
          "url": "https://musicreset.com/register",
          "mainEntity": {
            "@type": "WebApplication",
            "name": "Reset Music Registration",
            "applicationCategory": "Music Streaming",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free account registration for Reset Music streaming platform"
            },
            "featureList": [
              "Stream ambient and electronic music",
              "Create personalized playlists",
              "Subscribe to artists",
              "Discover experimental music"
            ]
          },
          "publisher": {
            "@type": "Organization",
            "name": "Reset Music",
            "url": "https://musicreset.com"
          },
          "potentialAction": {
            "@type": "RegisterAction",
            "target": "https://musicreset.com/register",
            "name": "Create Reset Music Account"
          }
        }}
        noIndex={true}
      />

      <BackgroundWrapper>
        <section className="w-full min-h-screen flex flex-col items-center">
          <img src={assets.reset_icon} className="w-10 py-3 block" alt="Reset Icon" />
          <div className="gradiant-line"></div>

          <div className="text-white sm:mt-auto mt-0 mb-auto flex flex-col justify-around items-center">
            <h1 className="text-4xl my-6">
              <span className="text-blue-700">sign up</span>, to musicreset
            </h1>

            <form
              className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Name Field */}
              <div className="w-full mb-1">
                <label htmlFor="name" className="md:text-xl text-lg">name</label>
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
                  disabled={loading}
                />
              </div>
              {formErrors.name && (
                <p className="text-red-500 text-left w-full text-sm mt-1">{formErrors.name}</p>
              )}

              {/* Email Field */}
              <div className="w-full mt-5 mb-1">
                <label htmlFor="email" className="md:text-xl text-lg">email</label>
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
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-left w-full text-sm mt-1">{formErrors.email}</p>
              )}

              {/* Password Field */}
              <div className="w-full mt-5 mb-1">
                <label htmlFor="password" className="md:text-xl text-lg">password</label>
              </div>
              <div className="w-full relative">
                <TbLockPassword className="inside-icon" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-login"
                  value={password}
                  onChange={handlePasswordChange} // 🔥 UPDATED
                  placeholder="Create a strong password"
                  disabled={loading}
                />
                <div className="eye-icon" onClick={() => setShowPassword((prev) => !prev)} role="button">
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </div>
              </div>

              {/* Password criteria */}
              <div className="text-sm mt-2 w-full flex flex-wrap gap-2">
                <span className={passwordCriteria.length ? "text-green-500" : "text-red-500"}>At least 8 characters</span>
                <span className={passwordCriteria.lowercase ? "text-green-500" : "text-red-500"}>• Lowercase</span>
                <span className={passwordCriteria.uppercase ? "text-green-500" : "text-red-500"}>• Uppercase</span>
                <span className={passwordCriteria.number ? "text-green-500" : "text-red-500"}>• Number</span>
                <span className={passwordCriteria.symbol ? "text-green-500" : "text-red-500"}>• Symbol</span>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-left w-full text-sm mt-1">{formErrors.password}</p>
              )}

              <div className="button-wrapper mt-9 shadow-sm shadow-black">
                <button className="custom-button" disabled={loading} type="submit">
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </div>

              <div className="flex items-center w-64 my-8">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="mx-4 text-white text-sm">Or Sign up With</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

              <div className="flex justify-around items-center w-52">
                <button
                  onClick={googleRegister}
                  type="button"
                  disabled={loading}
                  className={`w-full h-12 flex justify-center items-center rounded-lg bg-white transition-all hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={assets.google_icon} alt="google_icon" className="w-8 h-8" />
                </button>
              </div>
            </form>

            <p className={`mt-4 ${loading ? "pointer-events-none opacity-50" : ""}`}>
              Already have an account?{" "}
              <a href="/login" className="text-blue-800 underline">Login</a>
            </p>
          </div>
        </section>
      </BackgroundWrapper>
    </>
  );
};

export default Register;
