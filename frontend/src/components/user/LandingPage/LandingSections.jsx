import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

const stepsData = [
  {
    title: "Artist → Fan. No marketplace in between.",
    desc: "Sign up as an artist in minutes. Just your name, email, and a password to get started.",
  },
  {
    title: "Flexible monetisation, on your own terms",
    desc: "Tell us about yourself your artist name, genre, bio, and where you're from. Help listeners discover you.",
  },
  {
    title: "Reach global audience, Manage your releases",
    desc: "Submit your ID document and a sample track so we know you're the real deal. We review within 48 hours.",
  },
];

const StepCard = ({ step, index, isInView }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={isInView ? { opacity: 1, x: 0 } : {}}
    transition={{
      delay: 0.2 + index * 0.15,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="relative w-full"
    style={{
      boxShadow: `
        0 30px 40px rgba(0,0,0,0.75),
        0 12px 32px rgba(59,130,246,0.14)
      `,
      willChange: "transform, opacity",
    }}
  >
    {/* SVG shape with a gradient fill + glowing stroke */}
    <svg
      viewBox="48.3 69.3 753.3 111.3"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 w-full h-full"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient
          id={`cardGrad-${index}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0D1B3F" />
          <stop offset="100%" stopColor="#0A0A23" />
        </linearGradient>
      </defs>
      <path
        d="M674.3 76.3c0-3.9-3.1-7-7-7h-612c-3.9 0-7 3.1-7 7v97.3c0 3.9 3.1 7 7 7h739.3c3.9 0 7-3.1 7-7V97c0-3.9-3.1-7-7-7H681.3c-3.9 0-7-3.1-7-7v-6.8Z"
        fill={`url(#cardGrad-${index})`}
        stroke="rgba(96,165,250,0.18)"
        strokeWidth="1.3"
        fillRule="evenodd"
      />
    </svg>

    <div
  className="absolute inset-x-6 bottom-[-14px] h-10 blur-2xl opacity-100"
  style={{
    background: "rgba(0,0,0,1)",
    zIndex: -1,
  }}
/>

    {/* Content */}
    <div className="relative px-6 py-5">
      <h3 className="text-white font-semibold text-xl leading-tight mb-3 pt-1">
        {step.title}
      </h3>

      {/* Bottom glow line – always visible with a gradient fade */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px] opacity-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, #60a5fa, transparent)",
        }}
      />
    </div>
  </motion.div>
);

const LandingSections = () => {
  const perkRef = useRef(null);
  const navigate = useNavigate();

  const perkInView = useInView(perkRef, { once: true, margin: "-100px" });

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#020216" }}
    >
      {/* Background glows */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div
          className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[5%] -right-[5%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(29,78,216,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at 20% 40%, black 10%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 20% 40%, black 10%, transparent 70%)",
          }}
        />
      </div>

      <div className="page-content relative z-10">
        {/* ── ROW 1 — Artist Steps ── */}
        <div
          ref={perkRef}
          className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 mb-32 md:mb-40"
        >
          {/* LEFT — Step cards */}
          <div
            className="flex-1 w-full max-w-2xl flex flex-col gap-4"
            style={{ perspective: "1000px" }}
          >
            {stepsData.map((step, i) => (
              <StepCard
                key={step.title}
                step={step}
                index={i}
                isInView={perkInView}
              />
            ))}
          </div>

          {/* RIGHT — Text */}
          <motion.div
            className="flex-1 max-w-lg text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={perkInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h2
              className="font-extrabold tracking-tight leading-[1.08] mb-5 section-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={perkInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <span className="hero-heading-gradient block">
                Distribute Your
              </span>
              <span className="hero-heading-gradient block">Music For FREE</span>
            </motion.h2>

            <motion.p
              className="text-gray-400 font-light leading-relaxed mb-6 text-base md:text-lg"
              initial={{ opacity: 0, y: 15 }}
              animate={perkInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.72, duration: 0.6 }}
            >
              A focused platform for ambient & electronic sound—engaged listeners and fairer payouts
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={perkInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{
                borderColor: "rgba(59,130,246,0.5)",
                color: "#fff",
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate("/artist/register")}
              className="px-8 py-3.5 rounded-lg text-sm font-medium tracking-wide cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#D1D5DB",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.25s ease, color 0.25s ease",
              }}
            >
              Become an Artist
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingSections;
