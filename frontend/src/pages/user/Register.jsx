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

import PageSEO from "../../components/PageSeo/PageSEO";
import { validators } from "../../utills/validators";
import IconHeader from "../../components/user/IconHeader";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);
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
          
          const pendingToken = localStorage.getItem("pendingInviteToken");
          if (pendingToken) {
            localStorage.removeItem("pendingInviteToken");
            toast.success(`Welcome ${user.name}! Redirecting to accept invitation...`);
            navigate(`/accept-invite?token=${pendingToken}`);
          } else {
            toast.success(`Welcome ${user.name}! Please select your favorite genres.`);
            navigate("/genres");
          }
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
    setShowPasswordErrors(true);
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

      <>
      <section className="w-full min-h-screen flex flex-col items-center bg-[#020216] px-4">
        <IconHeader />

        <div className="text-white sm:mt-auto mt-10 mb-auto flex flex-col justify-around items-center w-full max-w-[650px]">
          <h1 className="text-4xl mb-6 font-['Jura'] uppercase tracking-wider font-extrabold text-center bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            sign up to musicreset
          </h1>

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
            {/* Name Field */}
            <div className="w-full mb-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">name</label>
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
              <p className="text-red-500 text-left w-full text-xs mt-1">{formErrors.name}</p>
            )}

            {/* Email Field */}
            <div className="w-full mt-5 mb-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">email</label>
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
              <p className="text-red-500 text-left w-full text-xs mt-1">{formErrors.email}</p>
            )}

            {/* Password Field */}
            <div className="w-full mt-5 mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">password</label>
            </div>
            <div className="w-full relative">
              <TbLockPassword className="inside-icon" />
              <input
                required
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-login"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                disabled={loading}
              />
              <div className="eye-icon" onClick={() => setShowPassword((prev) => !prev)} role="button">
                {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </div>
            </div>

            {/* Password criteria */}
            <div className="text-xs mt-3 w-full flex flex-wrap gap-2 text-slate-400">
              <span className={passwordCriteria.length ? "text-green-500" : (showPasswordErrors ? "text-red-400" : "text-slate-400")}>At least 8 characters</span>
              <span className={passwordCriteria.lowercase ? "text-green-500" : (showPasswordErrors ? "text-red-400" : "text-slate-400")}>• Lowercase</span>
              <span className={passwordCriteria.uppercase ? "text-green-500" : (showPasswordErrors ? "text-red-400" : "text-slate-400")}>• Uppercase</span>
              <span className={passwordCriteria.number ? "text-green-500" : (showPasswordErrors ? "text-red-400" : "text-slate-400")}>• Number</span>
              <span className={passwordCriteria.symbol ? "text-green-500" : (showPasswordErrors ? "text-red-400" : "text-slate-400")}>• Symbol</span>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-left w-full text-xs mt-1">{formErrors.password}</p>
            )}

            {/* Register Button */}
            <div className="w-full max-w-[380px] mt-9 flex justify-center">
              <button 
                className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                  boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                }}
                disabled={loading}
                type="submit"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </div>

            {/* Or Sign Up With */}
            <div className="flex items-center w-64 my-8">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-slate-400 text-sm">Or Sign up With</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            {/* Social Icons */}
            <div className="flex justify-around items-center w-full max-w-[380px]">
              <button
                onClick={googleRegister}
                type="button"
                disabled={loading}
                className={`w-full h-12 rounded-lg flex justify-center items-center bg-white transition-all duration-300 hover:bg-slate-100 active:scale-95 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <img src={assets.google_icon} alt="google_icon" className="w-6 h-6 mr-2" />
                <span className="text-black font-semibold text-sm">Sign up with Google</span>
              </button>
            </div>
          </form>

          {/* Already have account */}
          <p className={`mt-6 text-slate-400 ${loading ? "pointer-events-none opacity-50" : ""}`}>
            Already have an account?{" "}
            <a href="/login" style={{ color: '#4DB3FF' }} className="no-underline hover:underline hover:text-white transition-colors">
              Login
            </a>
          </p>
        </div>
      </section>
      </>
    </>
  );
};

export default Register;
