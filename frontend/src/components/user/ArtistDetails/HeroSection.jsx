import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const carouselSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1573120525707-4549889744f2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
      title: "Reset Music for Artist",
      subtitle:
        "Transform your musical journey with cutting-edge technology and unparalleled creative support. Discover new possibilities in music production and artist development.",
      stats: "10K+ Artists Joined",
      cta: "Start Your Journey",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1476",
      title: "Reset Music for Artist",
      subtitle:
        "Join a community of innovative artists pushing the boundaries of modern music creation. Collaborate, create, and conquer the music industry together.",
      stats: "500+ Collaborations",
      cta: "Join Community",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1695866648577-d833bf200754?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
      title: "Reset Music for Artist",
      subtitle:
        "Your vision, amplified. Experience the future of artist development and distribution with our state-of-the-art platform and tools.",
      stats: "AI-Powered Tools",
      cta: "Explore Features",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
      title: "Reset Music for Artist",
      subtitle:
        "From studio to stage, we provide the tools and platform for your artistic evolution. Grow your audience and master your craft with us.",
      stats: "Global Reach",
      cta: "Get Started",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1635961726947-0f821cf9ba28?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
      title: "Reset Music for Artist",
      subtitle:
        "Revolutionize your sound with AI-powered tools and expert guidance. Take your music to the next level with our comprehensive artist ecosystem.",
      stats: "24/7 Support",
      cta: "Learn More",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Images Stack */}
      <div className="absolute inset-0 w-full h-full">
        {carouselSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: index === 0 ? 1 : 0 }}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Section - Fixed Heading with Changing Subtitle */}
        <div className="flex-grow flex flex-col justify-center text-center text-white px-4 sm:px-6 py-8 sm:py-12 mt-8 sm:mt-16">
          {/* Static Heading - Always Visible */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Reset Music for Artist
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-900 mx-auto rounded-full"></div>
          </motion.div>

          {/* Changing Subtitle Only */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="max-w-4xl mx-auto mb-6 sm:mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-light text-gray-100 px-2">
                {carouselSlides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Static Sign Up Button and Changing Badge Container */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            {/* Static Sign Up Button */}
            <motion.div
              className="button-wrapper cursor-pointer shadow-sm shadow-black inline-block order-2 sm:order-1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="custom-button text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:shadow-xl"
                onClick={() => {
                  navigate("/register");
                }}
              >
                Sign Up
              </motion.button>
            </motion.div>

            {/* Changing Stats Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="inline-flex items-center px-4 sm:px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 order-1 sm:order-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm sm:text-base font-semibold">
                  {carouselSlides[currentSlide].stats}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Info Section - Made Fully Responsive */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="px-3 sm:px-6 pb-12 sm:pb-16"
          >
            {/* Mobile-first responsive grid: 1 column on mobile, 2 on small tablets, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <motion.div
                className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 w-full"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-300 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base sm:text-lg mb-2">
                  Your Music, Your Terms
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Take full control of your music career. Set your own prices,
                  release your tracks your way, and get paid securely through
                  Reset Music. We process your payments and ensure your earnings
                  reach you without hidden cuts.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 w-full"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-300 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base sm:text-lg mb-2">
                  Build Your Community
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Grow your audience with flexible support options. Offer
                  subscriptions or one-time access to your tracks you choose how
                  fans experience and support your music. Total freedom, total
                  control.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 w-full sm:col-span-2 lg:col-span-1"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base sm:text-lg mb-2">
                  Upload and Manage with Ease
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Upload your tracks or albums in few minutes we’ll handle updates
                  and manage your account for now. Your personal artist
                  dashboard is on the way with our upcoming platform release.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
