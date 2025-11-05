import React, { useState } from 'react';
import { 
  FaAd, 
  FaChartBar, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaSearch, 
  FaChartLine, 
  FaHeart, 
  FaQrcode, 
  FaTag,
  FaShieldAlt,
  FaMobile,
  FaDownload
} from 'react-icons/fa';

const ResetMusicFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <FaAd className="text-3xl" />,
      title: "No Advertising",
      description: "Music is art, not 'content.' You'll never see an ad on Bandcamp. At times, we partner with like-minded brands to bring more exposure to your music, helping you connect with new fans and to help increase sales on Bandcamp, all while keeping your fans' data protected.",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      icon: <FaChartBar className="text-3xl" />,
      title: "Chart Reporting",
      description: "We submit sales to SoundScan, ARIA Charts, OfficialCharts (UK & Ireland), and the Official New Zealand Music Charts.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <FaMoneyBillWave className="text-3xl" />,
      title: "Sell in Multiple Currencies",
      description: "Price your goods in USD, AUD, GBP, CAD, EUR, JPY or any of 12 other currencies.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: <FaShoppingCart className="text-3xl" />,
      title: "Dead-Simple Pre-orders",
      description: "Give fans one or more tracks immediately when they order. The full album appears instantly in their collection as soon as you release it.",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: <FaSearch className="text-3xl" />,
      title: "Search Engine Optimized",
      description: "We focus on getting you to the top of search results, so that you, not some cheesy lyric site or exploitative social network, get first crack at engaging your fans.",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Real-time Statistics",
      description: "See which tracks are most and least popular, who's linking to you, where your music is embedded, and which search terms are sending fans your way.",
      color: "from-teal-500 to-cyan-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
    {
      icon: <FaHeart className="text-3xl" />,
      title: "Fan Nirvana",
      description: "When a fan buys your music on Bandcamp (whether digital or physical), they get the convenience of instant, unlimited streaming from our Android and iOS apps, and the permanence and fidelity of a high-quality download.",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      icon: <FaQrcode className="text-3xl" />,
      title: "Album and Track Codes",
      description: "Generate single-use codes that fans can redeem for unlimited streaming and download of any track or album.",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      icon: <FaTag className="text-3xl" />,
      title: "Discount Codes",
      description: "Create discount codes for any of your items, set if and when they expire, and see how often they're used.",
      color: "from-amber-500 to-yellow-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text">
              Succeed
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Powerful tools and features designed specifically for artists to grow their audience and maximize revenue.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Features Navigation - Left Side */}
          <div className="lg:col-span-5">
            {/* Scrollable container with fixed height */}
            <div className="max-h-[600px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    activeFeature === index 
                      ? `${feature.bgColor} ${feature.borderColor} border-2 shadow-2xl scale-105` 
                      : 'bg-white bg-opacity-5 border border-gray-700 hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        activeFeature === index ? 'text-gray-900' : 'text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        activeFeature === index ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {feature.description.substring(0, 80)}...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Detail - Right Side */}
          <div className="lg:col-span-7">
            <div className={`p-8 rounded-3xl transition-all duration-500 ${
              features[activeFeature].bgColor
            } border-2 ${features[activeFeature].borderColor} shadow-2xl`}>
              
              {/* Feature Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} text-white shadow-lg`}>
                  {features[activeFeature].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {features[activeFeature].title}
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">Active & Available</span>
                  </div>
                </div>
              </div>

              {/* Feature Description */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {features[activeFeature].description}
                </p>
              </div>

              {/* Additional Visual Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Stats Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Performance</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Adoption Rate</span>
                      <span className="font-bold text-gray-900">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">User Satisfaction</span>
                      <span className="font-bold text-gray-900">4.8/5</span>
                    </div>
                  </div>
                </div>

                {/* Benefits Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Key Benefits</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Increased fan engagement
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Better revenue streams
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Enhanced visibility
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button className="px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
                <button className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  See Documentation
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeFeature === index 
                      ? `bg-gradient-to-r ${features[activeFeature].color} scale-125` 
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of artists who are already using these powerful features to grow their music career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Your Journey
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ResetMusicFeatures;