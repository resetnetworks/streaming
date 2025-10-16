// src/pages/About.jsx
import React from "react";
import { FiMusic, FiUsers, FiHeart, FiStar, FiHeadphones, FiMic, FiHome, FiMail, FiInstagram, FiTwitter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Footer from "../components/user/Footer";
import IconHeader from "../components/user/IconHeader";
import useNavigation from "../hooks/useAuthNavigation";
import PageSEO from "../components/PageSeo/PageSEO";


const About = () => {
  const navigate = useNavigate();
  const { navigateToHome } = useNavigation();

  const features = [
    {
      icon: FiHeadphones,
      title: "Listening Experience",
      description: "We offer an ever-growing library of tracks, albums, and curated playlists across genres—whether you're into indie, electronic, rock, hip-hop, or ambient explorations, Reset Music has something for every mood."
    },
    {
      icon: FiMic,
      title: "Artist Showcase",
      description: "We're committed to promoting emerging and established artists alike. From features to interviews, live sessions to exclusive drops, Reset Music gives artists the spotlight to share their stories and creativity with our community."
    },
    {
      icon: FiUsers,
      title: "Community & Connection",
      description: "Beyond just streaming, we build connection. Users can engage with artists, participate in music challenges, discover upcoming gigs, and join a network of fellow music lovers."
    },
    {
      icon: FiStar,
      title: "Innovation & Quality",
      description: "We invest in audio quality, user-friendly designs, and continuous innovation—making sure every touchpoint of using Reset Music feels intuitive, vibrant, and reliable."
    }
  ];

  const values = [
    {
      icon: FiMusic,
      title: "Music First",
      description: "Every decision we make starts with how it serves the music and the artists who create it."
    },
    {
      icon: FiHeart,
      title: "Community Driven",
      description: "We believe the best discoveries happen when passionate music lovers share what moves them."
    },
    {
      icon: FiUsers,
      title: "Artist Focused",
      description: "From emerging talents to established names, we provide a platform where every artist's voice matters."
    }
  ];

  return (
    <>
     <PageSEO
        title="About Reset Music Streaming - Our Mission & Values"
        description="Learn about Reset Music streaming platform's mission to connect music lovers & creators. Discover our values, community & transformative music."
        canonicalUrl="https://musicreset.com/about-us"
        structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "About Reset Music",
    "description": "about Reset Music's mission to connect music lovers, creators, and innovators. Discover our values, community.",
    "url": "https://musicreset.com/about-us",
    "mainEntity": {
      "@type": "Organization",
      "name": "Reset Music",
      "url": "https://musicreset.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@reset93.net",
        "contactType": "customer support"
      }
    },
    "dateModified": "2025-09-29"
  }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
        <IconHeader />
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-blue-900/30 border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <FiMusic className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-800 via-blue-400 to-blue-700 bg-clip-text text-transparent">
                  About Reset Music
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                We believe in the transformative power of music. Our mission is to connect listeners, creators, and innovators through a platform where music resets, renews, and redefines what it means to feel inspired.
              </p>

              {/* Back to Home Button */}
              <button
                onClick={navigateToHome}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300"
              >
                <FiHome className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Mission Section */}
          <div className="mb-20">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/20 p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                    <FiHeart className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Our Mission</h2>
                </div>
                
                <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  We exist to help artists reach new ears—and for listeners to discover sounds that refresh their day and stir their soul. Reset Music is where music resets your perspective, renews your energy, and redefines your connection to sound.
                </p>
              </div>
            </div>
          </div>

          {/* What We Do Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We Do</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Four pillars that define the Reset Music experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:bg-gray-700/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why We Started Section */}
          <div className="mb-20">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Why We Started</h2>
                <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    We saw a gap: music platforms often either cater only to big names or overwhelm users with volume without context. Reset Music was born to bridge that divide.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    We wanted a place where new voices matter, where discovering music is an experience, not a task—and where every listener finds something that truly resets them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center hover:bg-gray-700/30 transition-all duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
                      <value.icon className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Join Our Community Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-3xl border border-blue-500/30 p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Join Our Community</h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Whether you're here to discover, to create, or to simply play and pause with the soundtrack of your life—Reset Music is your space.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FiInstagram className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Follow Social</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    Updates, releases, behind-the-scenes content
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FiMail className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Newsletter</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    Exclusive tracks, artist stories, early access
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FiUsers className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Contribute</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    Artists, creators, curators—reach out and share your vision
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Ready to reset your music experience?</p>
                  <a
                    href="mailto:contact@reset93.net?subject=Community Inquiry"
                    className="text-blue-400 hover:underline font-medium"
                  >
                    contact@reset93.net
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default About;
