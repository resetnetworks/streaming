import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <svg
        width="60"
        height="60"
        viewBox="0 0 46 53"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            className="stroke-animate"
            d="M36.599 15.2069C39.3406 18.3656 41 22.489 41 27C41 36.9411 32.9411 45 23 45C13.0589 45 5 36.9411 5 27C5 17.0589 13.0589 9 23 9C23.4173 9 23.8312 9.0142 24.2414 9.04214"
            stroke="url(#paint0_linear_803_4322)"
            strokeWidth="2.8125"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        <rect
          x="28.1758"
          y="0.175781"
          width="2.64844"
          height="29.6484"
          rx="1.32422"
          fill="url(#paint1_linear_803_4322)"
          stroke="url(#paint2_linear_803_4322)"
          strokeWidth="0.351562"
        />
        <defs>
          <linearGradient
            id="paint0_linear_803_4322"
            x1="8.72414"
            y1="12.7241"
            x2="38.5172"
            y2="45"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.086327" stopColor="#88B2EF" />
            <stop offset="0.285547" stopColor="#1D3485" />
            <stop offset="0.441866" stopColor="#213782" />
            <stop offset="0.641761" stopColor="#0459FE" />
            <stop offset="0.723958" stopColor="#033CAA" />
            <stop offset="0.890708" stopColor="#17318C" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_803_4322"
            x1="28"
            y1="15.4286"
            x2="31"
            y2="15.4286"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#104BA5" />
            <stop offset="0.46875" stopColor="#459CCA" />
            <stop offset="1" stopColor="#000E3F" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_803_4322"
            x1="28.3103"
            y1="3.10345"
            x2="33.6443"
            y2="3.68129"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#CCDEF9" />
            <stop offset="0.359375" stopColor="#095CD6" />
            <stop offset="0.65625" stopColor="#1746A3" />
            <stop offset="1" stopColor="#0556F4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Loader;
