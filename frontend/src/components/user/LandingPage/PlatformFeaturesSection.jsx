import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaCreditCard, FaGlobe, FaHeadphones } from 'react-icons/fa';

/* ─── Card Data ─── */
const cardsData = [
  {
    title: 'Flexible Subscription /\nOne Time Purchases',
    desc: 'Flexible plans with Flexible subscriptions or one-time purchases to suit your music needs',
    icon: <FaCreditCard size={22} color="#60a5fa" />,
    currencies: null,
  },
  {
    title: 'Multi-Currency\nSupport',
    desc: 'Seamless payments with multi-currency support',
    icon: <FaGlobe size={22} color="#60a5fa" />,
    currencies: ['USD', 'GBP', 'EUR', 'JPY','INR'],
  },
  {
    title: 'Gorgeous Player\nand Intuitive UI',
    desc: 'Sleek, stunning player with a smooth, intuitive UI for effortless music navigation',
    icon: <FaHeadphones size={22} color="#60a5fa" />,
    currencies: null,
  },
];

/* ─── Shared color token — first card's blue ─── */
const C = {
  color:  '#60a5fa',
  glow:   'rgba(96,165,250,0.15)',
  border: 'rgba(96,165,250,0.25)',
  bg:     'rgba(96,165,250,0.08)',
};

/* ─── Card ─── */
const FeatureCard = ({ card, index, isInView }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ delay: 0.25 + index * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{
      y: -12,
      transition: { duration: 0.4, ease: 'easeOut' },
    }}
    className="group relative flex flex-col p-8 rounded-[24px] cursor-pointer"
    style={{
      background: 'linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: `
        0 20px 50px rgba(0,0,0,0.8),
        0 0 35px rgba(59,130,246,0.15),
        inset 0 1px 0 rgba(255,255,255,0.12)
      `,
      minHeight: '280px',
    }}
  >
    {/* Hover glow overlay */}
    <div
      className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        border: '1px solid rgba(96,165,250,0.5)',
        boxShadow: `
          16px 16px 50px rgba(0,0,0,0.8),
          -12px -12px 40px ${C.glow},
          inset 0 0 30px ${C.glow},
          0 0 25px rgba(96,165,250,0.3)
        `,
      }}
    />

    {/* Top accent line */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-[50%] h-[2px] transition-all duration-500 rounded-full"
      style={{ background: C.color, boxShadow: `0 0 10px ${C.color}` }}
    />

    {/* Icon */}
    <motion.div
      className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
      style={{
        background: `linear-gradient(135deg, ${C.bg}, rgba(96,165,250,0.08))`,
        border: `1px solid ${C.border}`,
        boxShadow: `0 8px 24px ${C.glow}`,
      }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ duration: 0.3 }}
    >
      {card.icon}
    </motion.div>

    {/* Title */}
    <h3 className="relative z-10 text-white font-extrabold text-xl leading-snug mb-3 whitespace-pre-line tracking-tight">
      {card.title}
    </h3>

    {/* Description */}
    <p className="relative z-10 text-slate-300 text-sm leading-relaxed flex-1 font-normal">
      {card.desc}
    </p>

    {/* Currency badges */}
    {card.currencies && (
      <div className="relative z-10 flex flex-wrap gap-2 mt-4">
        {card.currencies.map((curr) => (
          <span
            key={curr}
            className="px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider shadow-[0_0_10px_rgba(96,165,250,0.15)]"
            style={{
              background: C.bg,
              color: C.color,
              border: `1px solid ${C.border}`,
            }}
          >
            {curr}
          </span>
        ))}
      </div>
    )}

    {/* Bottom glow line */}
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] opacity-30 group-hover:opacity-60 transition-opacity duration-500"
      style={{ background: `linear-gradient(90deg, rgba(96,165,250,0), ${C.color}, rgba(96,165,250,0))` }}
    />
  </motion.div>
);

/* ─── Section ─── */
const PlatformFeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative pt-24 pb-24 md:pt-14 md:pb-60 overflow-hidden"
      style={{ background: "#09090D" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.06) 45%, rgba(37,99,235,0) 70%)' }}
        />
        <div
          className="absolute top-0 right-[-5%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(77,179,255,0.055) 1px, rgba(77,179,255,0) 1px), linear-gradient(to bottom, rgba(77,179,255,0.055) 1px, rgba(77,179,255,0) 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)',
          }}
        />
      </div>

      <div className="page-content relative z-10">

        {/* Heading — same style as HeroSection */}
        <motion.div
          className="mb-14 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >

          <h2 className="font-extrabold tracking-tight leading-[1.08] section-heading">
            <span className="hero-heading-gradient block">Join a Platform</span>
            <span className="hero-heading-gradient block">Built for You</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          style={{ perspective: '1200px' }}
        >
          {cardsData.map((card, i) => (
            <FeatureCard key={card.title} card={card} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeaturesSection;