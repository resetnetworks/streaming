import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineEmail } from "react-icons/md";
import { toast } from "sonner";
import IconHeader from "../components/user/IconHeader";
import BackgroundWrapper from "../components/BackgroundWrapper";

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
    <BackgroundWrapper>
    <section className="w-full min-h-screen flex flex-col items-center">
      <IconHeader />

      <div className="text-white mt-auto mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl mb-6 text-center">
          <span className="text-blue-700">forgot</span> your password?
        </h1>

        <form
          className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]"
          onSubmit={handleSubmit}
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
              disabled={loading}
              placeholder="Enter your registered email"
            />
          </div>

          {/* Submit Button */}
          <div className="button-wrapper mt-9 shadow-sm shadow-black">
            <button className="custom-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          {/* Back to Login */}
          <p className={`mt-4 ${loading ? "pointer-events-none opacity-50" : ""}`}>
            Remember your password?{" "}
            <a href="/login" className="text-blue-800 underline">
              Back to Login
            </a>
          </p>
        </form>
      </div>
    </section>
    </BackgroundWrapper>
    </>
  );
};

export default ForgotPassword;
