import React from 'react';
import { motion } from 'framer-motion';

const ToolsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const tools = [
    {
      icon: "🎵",
      title: "Stream Analytics",
      description: "Track your music's performance across all platforms with detailed insights and real-time data."
    },
    {
      icon: "🎯",
      title: "Fan Engagement",
      description: "Connect with your audience through interactive features and build a loyal fanbase."
    },
    {
      icon: "💰",
      title: "Revenue Tracking",
      description: "Monitor your earnings and optimize your music strategy for maximum revenue."
    },
    {
      icon: "🚀",
      title: "Promotion Tools",
      description: "Amplify your reach with built-in promotional features and marketing automation."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Side - Text Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80 font-medium"
              >
                FEATURES
              </motion.div>
              <motion.h2
                variants={itemVariants}
                className="text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Tools built for
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  your music
                </span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xl text-white/70 leading-relaxed max-w-md"
              >
                Grow your career while keeping your music at the center. 
                With our platform, you can amplify your reach, serve up 
                content, build pre-release hype, and sell merch and tickets — 
                right where streaming happens.
              </motion.p>
            </div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="flex items-center gap-2">
                  Get Started
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 space-y-4">
                  <motion.div
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {tool.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-pink-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                
                {/* Hover Effect Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-pink-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(147, 51, 234, 0.3))',
                    padding: '2px',
                    borderRadius: '16px',
                  }}
                >
                  <div className="w-full h-full bg-black/20 rounded-2xl backdrop-blur-sm"></div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom Section - Additional Info */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-32 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h3 className="text-3xl font-bold text-white">
              Ready to take your music to the next level?
            </h3>
            <p className="text-white/70 text-lg">
              Join thousands of artists who are already using our platform to grow their careers and connect with fans worldwide.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white border border-white/30 hover:border-white/60 font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ToolsSection;
