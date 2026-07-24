import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineEmail } from "react-icons/md";
import { toast } from "sonner";
import IconHeader from "../../components/user/IconHeader";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/forgot-password`,
        { email }
      );
      toast.success(res.data.message || "Reset link sent successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="w-full min-h-screen flex flex-col items-center bg-[#020216] px-4">
        <IconHeader />

        <div className="text-white sm:mt-auto mt-10 mb-auto flex flex-col justify-around items-center w-full max-w-[650px]">
          <h1 className="text-4xl mb-6 font-['Jura'] uppercase tracking-wider font-extrabold text-center bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            forgot your password?
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
          >
            {/* Email Field */}
            <div className="w-full mb-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
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
                disabled={loading}
                placeholder="Enter your registered email"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full max-w-[380px] mt-9 flex justify-center">
              <button 
                className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                  boxShadow: '0 0 15px rgba(51, 128, 255, 0.2)',
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            {/* Back to Login */}
            <p className={`mt-6 text-slate-400 ${loading ? "pointer-events-none opacity-50" : ""}`}>
              Remember your password?{" "}
              <a href="/login" style={{ color: '#4DB3FF' }} className="no-underline hover:underline hover:text-white transition-colors">
                Back to Login
              </a>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
