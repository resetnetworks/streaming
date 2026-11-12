import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── Flip-fade animated word ─── */
const Letter = memo(function Letter({ char, letterDuration }) {
  return (
    <motion.span
      style={{ 
        transformStyle: "preserve-3d", 
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translate3d(0,0,0) rotateX(0deg)",
        WebkitTransform: "translate3d(0,0,0) rotateX(0deg)"
      }}
      variants={{
        initial: { rotateX: 90, y: 20, opacity: 0, translateZ: "0px", z: "0px" },
        animate: {
          rotateX: 0,
          y: 0,
          opacity: 1,
          translateZ: "0px",
          z: "0px",
          transition: { duration: letterDuration, ease: [0.2, 0.65, 0.3, 0.9] }, // Restored original timing & ease curve
        },
        exit: {
          rotateX: -90,
          y: -20,
          opacity: 0,
          translateZ: "0px",
          z: "0px",
          transition: { duration: letterDuration * 0.67, ease: "easeIn" }, // Restored original timing & ease curve
        },
      }}
      className="inline-block hero-heading-letter"
    >
      {char}
    </motion.span>
  );
});

const AnimatedWord = memo(function AnimatedWord({
  text,
  staggerDelay,
  exitStaggerDelay,
  letterDuration,
}) {
  const letters = useMemo(() => text.split(""), [text]);
  return (
    <motion.span
      className="inline-flex"
      style={{ 
        whiteSpace: "pre",
        transform: "translate3d(0,0,0)",
        WebkitTransform: "translate3d(0,0,0)",
        willChange: "transform"
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { staggerChildren: staggerDelay } },
        exit: { opacity: 1, transition: { staggerChildren: exitStaggerDelay } },
      }}
    >
      {letters.map((char, i) => (
        <Letter
          key={`${char}-${i}`}
          char={char}
          letterDuration={letterDuration}
        />
      ))}
    </motion.span>
  );
});

const cycleWords = ["Musicians", "Listeners", "Audiophiles"];

function CyclingWord() {
  const [index, setIndex] = useState(0);

  const updateIndex = useCallback(() => {
    setIndex((prev) => (prev + 1) % cycleWords.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(updateIndex, 3000);
    return () => clearInterval(timer);
  }, [updateIndex]);

  return (
    <span
      className="inline-block relative animate-gpu"
      style={{ 
        perspective: "1000px", 
        minWidth: "4ch",
        transform: "translate3d(0,0,0)",
        WebkitTransform: "translate3d(0,0,0)",
        willChange: "transform"
      }}
    >
      <AnimatePresence mode="wait">
        <AnimatedWord
          key={cycleWords[index]}
          text={cycleWords[index]}
          staggerDelay={0.07}
          exitStaggerDelay={0.04}
          letterDuration={0.5}
        />
      </AnimatePresence>
    </span>
  );
}

/* ─── Floating music card ─── */
const MusicCard = ({ goToHome, isHeroInView }) => (
  <motion.div
    initial={{ opacity: 0, x: 60, y: 20 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
    className="relative w-[260px] md:w-[340px]"
  >
    {/* Shadow — left */}
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ opacity: 0.45, x: -38, y: -18, rotate: -8 }}
      transition={{ delay: 1.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 left-0 right-0 h-[72%] rounded-3xl border border-[#4DB3FF]/20 -z-10"
      style={{
        background: "linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)",
        transformOrigin: "top center",
      }}
    />
    {/* Shadow — right */}
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ opacity: 0.45, x: 38, y: -18, rotate: 8 }}
      transition={{ delay: 1.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 left-0 right-0 h-[72%] rounded-3xl border border-[#4DB3FF]/20 -z-10"
      style={{
        background: "linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)",
        transformOrigin: "top center",
      }}
    />
    {/* Main card */}
    <div
      className="relative w-[260px] md:w-[340px] rounded-3xl overflow-hidden border border-[#4DB3FF]/40 z-10"
      style={{
        background: "linear-gradient(145deg, #0F224E 0%, #080D1F 100%)",
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(59,130,246,0.25)",
      }}
    >
      {/* Album art */}
      <div
        className="relative overflow-hidden h-[240px] md:h-[340px]"
        style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #09090D 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0) 60%), radial-gradient(ellipse at 70% 70%, rgba(29,78,216,0.5) 0%, rgba(29,78,216,0) 50%)",
          }}
        />
        <motion.div
          animate={isHeroInView ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[22%] w-[140px] h-[140px] opacity-80"
          style={{
            background:
              "conic-gradient(from 0deg, #3B82F6, #1D4ED8, #2563EB, #3B82F6)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            willChange: "transform",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: "linear-gradient(to top, #0A0A23 0%, rgba(10,10,35,0) 100%)",
          }}
        />
      </div>
      {/* Card info */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
          >
            M
          </div>
          <span className="text-sm text-slate-300 font-semibold">resetmusic</span>
        </div>
        <p className="text-white font-extrabold text-xl mb-1 tracking-tight">Midnight Signal</p>
        <p className="text-[#4DB3FF] text-xs font-semibold tracking-wider uppercase">Ambient · Instrumental</p>
        {/* <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="w-full py-3 rounded-xl text-white text-sm font-bold cursor-pointer border-none tracking-wide"
          style={{
            background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
            boxShadow: '0 0 20px rgba(51,128,255,0.4)',
          }}
          onClick={goToHome}
        >
          Listen Now
        </motion.button> */}
      </div>
    </div>
  </motion.div>
);

/* ─── Main Hero ─── */
const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef);

  return (
    <div
      ref={heroRef}
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "#09090D" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[950px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.28) 0%, rgba(37,99,235,0.08) 45%, rgba(37,99,235,0) 70%)",
          }}
        />
        <div
          className="absolute top-[25%] -left-[8%] w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%)",
          }}
        />
        <div
          className="absolute top-[10%] -right-[3%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(29,78,216,0.2) 0%, rgba(29,78,216,0) 70%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(77,179,255,0.065) 1px, rgba(77,179,255,0) 1px), linear-gradient(to bottom, rgba(77,179,255,0.065) 1px, rgba(77,179,255,0) 1px)`,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 75%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pt-24 pb-20 md:pt-20 md:pb-16 mt-8 md:mt-0">
        <div className="page-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 lg:gap-20">
            {/* LEFT — text */}
            <div className="flex-1 min-w-0 max-w-4xl w-full text-center md:text-left">
              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="hero-heading font-extrabold leading-[1.08] tracking-[-0.03em] mb-8"
              >
                <span className="hero-heading-gradient block">For The Next Gen</span>
                <span className="hero-heading-gradient block">
                  <CyclingWord />
                </span>
              </motion.h1>

              {/* Sub */}
              {/* <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.75 }}
                className="text-gray-400 font-light leading-relaxed mb-4 text-base sm:text-lg max-w-lg mx-auto md:mx-0"
              >
                From ambient, drone, IDM, techno, DJ sets, electroacoustic, experimental, and cinematic instrumentals if it moves you, it belongs here.
              </motion.p> */}

              {/* Genre tags */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.6 }}
                className="flex flex-wrap gap-2 justify-center md:justify-start mb-10"
              >
                {[
                  "Ambient",
                  "IDM",
                  "Drone",
                  "Techno",
                  "Cinematic",
                  "Experimental",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium text-[#4DB3FF] border border-[#4DB3FF]/20"
                    style={{ background: "rgba(77,179,255,0.06)" }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.72, duration: 0.7 }}
                className="flex flex-wrap gap-3.5 justify-center md:justify-start mb-10"
              >
                <motion.button
                  onClick={() => navigate("/home")}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.96, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="px-8 py-3.5 sm:px-9 sm:py-4 rounded-xl text-white text-sm sm:text-base font-bold cursor-pointer border-none tracking-wide"
                  style={{
                    background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                    boxShadow: "0 0 30px rgba(51,128,255,0.45)",
                  }}
                >
                  Start Streaming
                </motion.button>
                <motion.button
                  onClick={() => navigate("/artist/register")}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="px-8 py-3.5 sm:px-9 sm:py-4 rounded-xl text-white text-sm sm:text-base font-semibold cursor-pointer tracking-wide border border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  Join as Artist
                </motion.button>
              </motion.div>
            </div>

            {/* RIGHT — card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-shrink-0 items-center justify-center"
            >
              <MusicCard goToHome={() => navigate("/home")} isHeroInView={isHeroInView} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-[5]"
        style={{ background: "linear-gradient(to top, #09090D 0%, rgba(9,9,13,0) 100%)" }}
      />
    </div>
  );
};

export default HeroSection;
