// src/pages/Help.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { FiChevronDown, FiChevronRight, FiHelpCircle, FiPhone, FiMail, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Footer from "../components/user/Footer";
import IconHeader from "../components/user/IconHeader";

const Help = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const faqData = [
    {
      id: "account",
      title: "Account",
      questions: [
        {
          q: "What should I do if I forgot my password?",
          a: 'To reset your password, first log out of your account. Then, go to the login page and click on the "Reset Password" text located below the password field. Enter your email address and click the "Send Reset Link" button. A reset link will be sent to your email. Click on that link, create your new password, and submit it. Please make sure to do this only once.'
        },
        {
          q: "I made a payment but didn't receive the song or subscription. What should I do?",
          a: 'If you\'ve successfully completed a payment for a song or an artist subscription but haven\'t received access, please contact us immediately. Email us at <a href="mailto:contact@reset93.net" class="text-blue-400 hover:underline">contact@reset93.net</a> with the following:<br/><br/>• Your registered email or username<br/>• Payment proof (screenshot or transaction ID)<br/>• Name of the song or artist you paid for<br/><br/>We\'ll verify and resolve the issue as quickly as possible.'
        }
      ]
    },
    {
      id: "subscription",
      title: "Subscription",
      questions: [
        {
          q: "How do I cancel my subscription?",
          a: "To cancel your subscription, click on your profile and go to Manage Subscription. From there, find the subscription you want to cancel and click the Cancel button."
        },
        {
          q: "Can I change my plan?",
          a: "Yes, you can upgrade or downgrade from the plans page."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Issues",
      questions: [
        {
          q: "My player is stuck in the loading state. What should I do?",
          a: "You need to click on a song to start playback. This is a common situation for new users — once you select a song, the player will activate and start working normally."
        }
      ]
    }
  ];

  const tableOfContents = [
    "Account",
    "Subscription", 
    "Technical Issues"
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Help & Support | musicreset - Reset Music Streaming Platform</title>
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Need help with musicreset? Get support for streaming, subscriptions, and payments. Find answers or contact the Reset Music team for assistance."
        />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
        <IconHeader />
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-blue-900/30 border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <FiHelpCircle className="md:w-8 md:h-8 w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-800 via-blue-400 to-blue-700 bg-clip-text text-transparent leading-tight md:leading-[1.2] py-2">
                  Help & Support
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The official support center for <strong>musicreset</strong> — your platform for ambient, instrumental, and experimental music
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiHelpCircle className="w-4 h-4" />
                  <span>We're here to help with account access, subscriptions, streaming issues, and more</span>
                </div>
              </div>

              {/* Back to Home Button */}
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300"
              >
                <FiHome className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiHelpCircle className="w-5 h-5 text-blue-400" />
                    Frequently Asked Questions
                  </h2>
                  
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => {
                      const sectionId = faqData[index]?.id;
                      return (
                        <button
                          key={index}
                          onClick={() => scrollToSection(sectionId)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-blue-300 hover:bg-blue-600/10 transition-all duration-200"
                        >
                          {item}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {faqData.map((section, index) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-6 text-left hover:bg-gray-700/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {section.title}
                        </h3>
                        <div className="text-gray-400">
                          {expandedSection === section.id ? (
                            <FiChevronDown className="w-5 h-5" />
                          ) : (
                            <FiChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {expandedSection === section.id && (
                      <div className="px-6 pb-6 border-t border-gray-700/50">
                        <div className="pt-4 space-y-4">
                          {section.questions.map((question, qIndex) => (
                            <div key={qIndex} className="bg-gray-700/30 rounded-xl p-4">
                              <h4 className="font-semibold text-white mb-3">
                                {question.q}
                              </h4>
                              <div
                                className="text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: question.a }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 p-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white">Still Need Help?</h3>
                  <p className="text-gray-300">
                    If you made a payment but didn't receive the song or subscription access, please contact us with your payment proof. We'll resolve the issue as soon as possible.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <FiMail className="w-5 h-5 text-blue-400" />
                        <h4 className="font-medium text-white">Email Support</h4>
                      </div>
                      <a
                        href="mailto:contact@reset93.net?subject=Help & Support Request"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                      >
                        contact@reset93.net
                      </a>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <FiPhone className="w-5 h-5 text-blue-400" />
                        <h4 className="font-medium text-white">Phone Support</h4>
                      </div>
                      <a
                        href="tel:+919266084749"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                      >
                        +91 9266084749
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Issue Notice */}
              <div className="mt-8 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <FiMail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-300 mb-2">
                      Payment Issues? Contact Us With:
                    </h4>
                    <ul className="text-amber-200/80 text-sm space-y-1">
                      <li>• Your registered email or username</li>
                      <li>• Payment proof (screenshot or transaction ID)</li>
                      <li>• Name of the song or artist you paid for</li>
                      <li>• We'll verify and resolve the issue as quickly as possible</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Support Promise */}
              <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FiHelpCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">
                      Our Support Promise:
                    </h4>
                    <ul className="text-green-200/80 text-sm space-y-1">
                      <li>• Fast response times for payment-related issues</li>
                      <li>• Comprehensive help with account management</li>
                      <li>• Technical support for streaming problems</li>
                      <li>• Friendly and knowledgeable support team</li>
                    </ul>
                  </div>
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

export default Help;
