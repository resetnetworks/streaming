import React from "react";
import { useState } from "react";
import IconHeader from "../../components/IconHeader";

const Subscription = () => {
  const [selected, setSelected] = useState("monthly");
  return (
    <section className="bg-image min-h-screen w-full flex flex-col items-center text-white">
      <IconHeader />
      <h1 className="text-4xl mb-1 mt-10">
        choose <span className="text-blue-700">subscription plan</span>
      </h1>
      <p className="text-sm">
        listen without limits on your phone, speaker, and other devices
      </p>

      <div className="subscription-wrapper mt-8">
        <div className="subscription-card md:w-[25.25rem] py-4 px-2 h-[31.5rem] w-[90vw] flex flex-col items-center">
          <h2 className="text-3xl">individual</h2>
          <p className="text-6xl text-blue-700 mt-6 font-bold">
            <sup
              className="text-gray-400 font-light 
              text-4xl"
            >
              $
            </sup>
            5
            <sub
              className="text-gray-400 font-light 
              text-4xl"
            >
              /m
            </sub>
          </p>

          <div className="flex bg-[#d9e2f1] p-1 rounded-lg mt-12 shadow-inner w-max">
            <button
              onClick={() => setSelected("monthly")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                selected === "monthly"
                  ? "bg-[#0050d8] text-white shadow-md shadow-black"
                  : "text-[#9ca3af]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelected("annually")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                selected === "annually"
                  ? "bg-[#0050d8] text-white shadow-md shadow-black"
                  : "text-[#9ca3af]"
              }`}
            >
              Annually.  this is for testing
            </button>
          </div>

          <ul className="text-left mt-6">
            <li>✓ Add Free Music Listening</li>
            <li>✓ Downaload Songs</li>
            <li>✓ Up to 10 survey results archived</li>
          </ul>

          <div className="button-wrapper mt-12 shadow-sm shadow-black">
            <button className="custom-button">get started</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
