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
        stroke="rgba(77,179,255,0.4)"
        strokeWidth="1.5"
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
      <h3 className="text-white font-bold text-xl leading-tight">
        {step.title}
      </h3>

      {/* Bottom glow line – always visible with a gradient fade */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px] opacity-60"
        style={{
          background:
            "linear-gradient(90deg, rgba(96,165,250,0), #60a5fa, rgba(96,165,250,0))",
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
      style={{ background: "#09090D" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.06) 45%, rgba(37,99,235,0) 70%)",
          }}
        />
        <div
          className="absolute bottom-[5%] -right-[5%] w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(29,78,216,0.18) 0%, rgba(29,78,216,0) 70%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(77,179,255,0.055) 1px, rgba(77,179,255,0) 1px), linear-gradient(to bottom, rgba(77,179,255,0.055) 1px, rgba(77,179,255,0) 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at 20% 40%, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 20% 40%, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)",
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
              className="text-slate-300 font-normal leading-relaxed mb-8 text-base md:text-lg"
              initial={{ opacity: 0, y: 15 }}
              animate={perkInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.72, duration: 0.6 }}
            >
              A focused platform for ambient & electronic sound—engaged listeners and fairer payouts
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={perkInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/artist/register")}
              className="px-8 py-3.5 sm:px-9 sm:py-4 rounded-xl text-white text-sm sm:text-base font-semibold cursor-pointer tracking-wide border border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
              style={{ backdropFilter: 'blur(8px)' }}
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
