import React from "react";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword, TbUserSquareRounded } from "react-icons/tb";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa6";
import { assets } from "../assets/assets";
import { useState } from "react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="w-full min-h-screen bg-image flex flex-col items-center">
      <img src={assets.reset_icon} className="w-10 py-3 block" alt="" />
      <div className="gradiant-line"></div>

      <div className="text-white mt-auto mb-auto flex flex-col justify-around items-center">
        <h1 className="text-4xl my-6">
          <span className="text-blue-700">sign up</span>, it's free
        </h1>

        <form className="md:w-[650px] w-[95vw] rounded-t-lg md:py-6 md:px-12 py-3 px-6 flex items-center flex-col border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f]">
          <div className="w-full mb-1">
            <label htmlFor="email" className="md:text-xl text-lg">
              email
            </label>
          </div>
          <div className="w-full relative">
            <MdOutlineEmail className="inside-icon" />
            <input required type="email" className="input-login" />
          </div>

          <div className="w-full mt-5 mb-1">
            <label htmlFor="email" className="md:text-xl text-lg">
              password
            </label>
          </div>
          <div className="w-full relative">
            <TbLockPassword className="inside-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              className="input-login"
            />
            <div
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
          </div>

          <div className="w-full mb-1 mt-5">
            <label htmlFor="email" className="md:text-xl text-lg">
              name
            </label>
          </div>
          <div className="w-full relative">
            <TbUserSquareRounded className="inside-icon" />
            <input required type="email" className="input-login" />
          </div>

          <div className="w-full mb-1 mt-5">
            <label htmlFor="dob" className="md:text-xl text-lg">
              date of birth
            </label>
          </div>

          <div className="w-full flex justify-between gap-2">
            {/* Month */}
            <div className="relative flex-1">
              <select
                required
                className="input-login w-full appearance-none bg-white text-black pr-8"
              >
                <option value="">month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-600">
                <FaChevronDown />
              </div>
            </div>

            {/* Day */}
            <div className="relative flex-1">
              <select
                required
                className="input-login w-full appearance-none bg-white text-black pr-8"
              >
                <option value="">day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-600">
                <FaChevronDown />
              </div>
            </div>

            {/* Year */}
            <div className="relative flex-1">
              <select
                required
                className="input-login w-full appearance-none bg-white text-black pr-8"
              >
                <option value="">year</option>
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={i} value={2025 - i}>
                    {2025 - i}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-600">
                <FaChevronDown />
              </div>
            </div>
          </div>

          <div className="button-wrapper mt-9 shadow-sm shadow-black">
            <button className="custom-button">Submit</button>
          </div>

          <div className="flex items-center w-64 my-8">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="mx-4 text-white text-sm">Or Sign up With</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <div className="flex justify-around items-center md:w-64 w-52">
            <a
              href="#"
              className="w-12 h-12 bg-white  rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.google_icon}
                alt="apple_icon"
                className="w-6 h-6"
              />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white  rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.facebook_icon}
                alt="apple_icon"
                className="w-6 h-6"
              />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white  rounded-lg flex justify-center items-center"
            >
              <img
                src={assets.apple_icon}
                alt="apple_icon"
                className="w-6 h-6"
              />
            </a>
          </div>
        </form>
        <p className="mt-4">
          already a reset user?{" "}
          <a href="#" className="text-blue-800 underline">
            login
          </a>
        </p>
      </div>
    </section>
  );
};

export default Register;
