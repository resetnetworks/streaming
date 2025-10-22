import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaUsers, FaMusic, FaBroadcastTower, FaPlay } from 'react-icons/fa';

// Counter component for animated numbers
const Counter = ({ value, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value.replace(/\D/g, ""));
      const incrementTime = (duration * 1000) / end;
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-3xl font-bold text-blue-400 mb-2">
      {count}{suffix}
    </div>
  );
};

// Accept the scrollContainerRef as a prop.
const HowItWorksSection = ({ scrollContainerRef }) => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  // Tell useInView to use the passed ref as the scroll "root".
  const isInView = useInView(sectionRef, {
    root: scrollContainerRef,
    once: true,
    amount: 0.3
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: FaPlay,
      title: "On Demand Streaming",
      description: "Instantly stream your favorite Music On Demand, Anytime, Anywhere"
    },
    {
      icon: FaUsers,
      title: "Build your Audience and Fanbase",
      description: "Connect with music lovers and audiophiles worldwide"
    },
    {
      icon: FaMusic,
      title: "Increased Fan to Artist Ratio",
      description: "Boost artist reach with a higher fan-to-artist ratio, building stronger connections"
    }
  ];

  // Stats data
  const stats = [
    { number: "500", suffix: "+", label: "Hours Streamed" },
    { number: "150", suffix: "+", label: "Song Available" },
    { number: "190", suffix: "+", label: "Countries" },
    { number: "99", suffix: "%", label: "Uptime" }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pb-10"
    >
      <div className='gradiant-line mb-7'></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-5 gap-16 items-center"
        >
          {/* Left content - 2 of 5 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            {/* Section Tag */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <FaBroadcastTower className="text-blue-400 text-sm" />
              <span className="text-blue-300 text-sm font-medium">How MusicReset Works</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Instantly stream your favorite 
                <span className="block text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text leading-tight">
                  <span className="block sm:inline">Music On Demand,</span>
                  <span className="block sm:inline sm:ml-2">Anytime, Anywhere</span>
                </span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                By creating a niche streaming platform within the realm of ambient and instrumental music, we'll be leveraging the situation by enabling a more dedicated fanbase, community; thereby exponentially increasing artist to fan reach as well as significantly increase royalties.
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="space-y-6">
              <p className="text-lg text-slate-400 leading-relaxed">
                We are open to all kinds of music that falls into the instrumental, classical music, orchestral music, film scores, field recordings, soundscapes, electroacoustic, music concrète, avant-garde experimental, ambient, drone, electronic, industrial, IDM, drum'n'bass, techno or other DIY instruments, and/or any genre under the sun, You Name it.
              </p>

              {/* Features List */}
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <feature.icon className="text-blue-400 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-slate-400 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right image section - 3 of 5 columns */}
          <motion.div 
            variants={imageVariants}
            className="relative lg:col-span-3"
          >
            {/* Image Container with 3D Effect */}
            <div className="relative group">
              {/* Background Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Image Frame */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-2xl border border-slate-700/50 shadow-2xl">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 relative group-hover:scale-[1.02] transition-transform duration-500">
                  {/* Image Element with Hover Animation */}
                  <motion.img
                    ref={imageRef}
                    src="/images/home.png" // Replace with your image path
                    alt="Platform Overview"
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    animate={isInView ? {
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    } : {}}
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully");
                    }}
                    onError={(e) => {
                      console.error("Image error:", e);
                    }}
                  />

                  {/* Image Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold text-lg">Platform Overview</h3>
                      <p className="text-slate-300 text-sm">Discover the future of music streaming</p>
                    </div>
                  </div>

                  {/* Additional animated elements for visual interest */}
                  <motion.div
                    className="absolute bottom-4 left-4 w-16 h-1 bg-blue-500/50 rounded-full"
                    animate={{ 
                      width: ["0%", "100%", "0%"],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-24 pt-12 border-t border-slate-800"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Join Thousands of Music Lovers Worldwide</h3>
            <p className="text-slate-400">Experience the future of music streaming</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <Counter value={stat.number} suffix={stat.suffix} duration={2} />
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
