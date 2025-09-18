// src/pages/PrivacyPolicy.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { FiChevronDown, FiChevronRight, FiShield, FiLock, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Footer from "../components/user/Footer";
import IconHeader from "../components/user/IconHeader";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const privacyData = [
    {
      id: "introduction",
      title: "Introduction",
      content: `Welcome to Reset — a music streaming platform designed for immersive, vocal-free experiences powered by cutting-edge audio technology. Your privacy is important to us. This Privacy Policy outlines how we collect, use, share, and protect your personal data when you use our services.`
    },
    {
      id: "what-we-collect",
      title: "1. What We Collect",
      content: `a. Account Information
• Name
• Email address
• Password (encrypted)
• Phone number (if provided)
• Payment details (via PayU, Razorpay, etc.)

b. Usage Data
• Tracks streamed, playlists, likes, listening habits
• Device and browser type
• IP address and approximate location
• Log data like access times, pages viewed

c. Cookies & Tracking
We use cookies and tools (e.g., Google Analytics) to personalize your experience and analyze usage.`
    },
    {
      id: "how-we-use",
      title: "2. How We Use Your Information",
      content: `• To provide and enhance our services
• To personalize content and recommendations
• To facilitate payments and subscriptions
• To send service updates, offers, or notices
• To secure the platform and prevent abuse`
    },
    {
      id: "sharing-disclosure",
      title: "3. Sharing & Disclosure",
      content: `We do not sell your personal data. However, we may share data with:
• Service Providers (e.g., payments, analytics)
• Law enforcement (if legally required)
• Affiliated partners under strict confidentiality`
    },
    {
      id: "data-security",
      title: "4. Data Security",
      content: `We implement strong technical and organizational security measures including:
• End-to-end encryption for sensitive data
• Secure servers and access control
• Regular audits and compliance reviews`
    },
    {
      id: "your-rights",
      title: "5. Your Rights",
      content: `Depending on your region, you may have the right to:
• Access or export your personal data
• Correct inaccurate information
• Delete your account and data
• Object to specific processing
• Unsubscribe from promotional emails

To exercise any of these rights, email us at: contact@reset93.net`
    },
    {
      id: "childrens-privacy",
      title: "6. Children's Privacy",
      content: `Reset is not intended for users under 13. We do not knowingly collect data from children.`
    },
    {
      id: "international-users",
      title: "7. International Users",
      content: `If you access Reset from outside India, your data may be processed and stored in India or other countries. By using our service, you consent to such transfers.`
    },
    {
      id: "policy-changes",
      title: "8. Changes to this Policy",
      content: `We may update this Privacy Policy occasionally. The updated version will be posted here with a new "Last Updated" date. Continued use of the service implies acceptance.`
    },
    {
      id: "contact-us",
      title: "9. Contact Us",
      content: `Reset Networks Studios
Website: musicreset.com
Email: contact@reset93.net

Note: If you request data deletion, make sure you send the request using your own registered email.`
    }
  ];

  const tableOfContents = [
    "Introduction",
    "1. What We Collect",
    "2. How We Use Your Information", 
    "3. Sharing & Disclosure",
    "4. Data Security",
    "5. Your Rights",
    "6. Children's Privacy",
    "7. International Users",
    "8. Changes to this Policy",
    "9. Contact Us"
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
        <title>Privacy Policy | musicreset</title>
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Learn how musicreset collects, uses, and protects your personal data while you stream ambient, instrumental, and experimental music."
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
                  <FiShield className="md:w-8 md:h-8 w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-800 via-blue-400 to-blue-700 bg-clip-text text-transparent leading-tight md:leading-[1.2] py-2">
                  Privacy Policy
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Learn how musicreset collects, uses, and protects your personal data while you stream ambient, instrumental, and experimental music
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  <span>Effective Date: 24 July 2025 | Last Updated: 25 July 2025</span>
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
                    <FiShield className="w-5 h-5 text-blue-400" />
                    Table of Contents
                  </h2>
                  
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => {
                      const sectionId = privacyData[index]?.id;
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
                {privacyData.map((section, index) => (
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
                        <div className="pt-4">
                          <div className="prose prose-invert max-w-none">
                            {section.content.split('\n').map((paragraph, pIndex) => (
                              <div key={pIndex} className="mb-4 last:mb-0">
                                {paragraph.startsWith('•') ? (
                                  <div className="flex items-start gap-3">
                                    <span className="text-blue-400 mt-2">•</span>
                                    <span className="text-gray-300 leading-relaxed">
                                      {paragraph.substring(1).trim()}
                                    </span>
                                  </div>
                                ) : paragraph.match(/^[a-z]\.\s/) ? (
                                  <p className="text-gray-200 font-medium leading-relaxed">
                                    {paragraph}
                                  </p>
                                ) : paragraph.match(/^[0-9]+\.\s/) ? (
                                  <p className="text-gray-200 font-medium leading-relaxed">
                                    {paragraph}
                                  </p>
                                ) : paragraph.includes('contact@reset93.net') ? (
                                  <p className="text-gray-300 leading-relaxed">
                                    {paragraph.replace('contact@reset93.net', '')}
                                    <a
                                      href="mailto:contact@reset93.net?subject=Privacy Rights Request"
                                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                    >
                                      contact@reset93.net
                                    </a>
                                  </p>
                                ) : paragraph.includes('musicreset.com') ? (
                                  <p className="text-gray-300 leading-relaxed">
                                    {paragraph.replace('musicreset.com', '')}
                                    <a
                                      href="https://musicreset.com"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                    >
                                      musicreset.com
                                    </a>
                                  </p>
                                ) : paragraph.trim() && (
                                  <p className="text-gray-300 leading-relaxed">
                                    {paragraph}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 p-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white">Questions About Your Privacy?</h3>
                  <p className="text-gray-300">
                    If you have any questions about this Privacy Policy, please contact us.
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Reset Networks Studios</p>
                    <p>
                      Website: {" "}
                      <a 
                        href="https://musicreset.com" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        musicreset.com
                      </a>
                    </p>
                    <p>
                      Email: {" "}
                      <a
                        href="mailto:contact@reset93.net?subject=Privacy Policy Inquiry"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        contact@reset93.net
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Deletion Notice */}
              <div className="mt-8 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <FiLock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-300 mb-2">
                      Important Data Deletion Notice:
                    </h4>
                    <p className="text-amber-200/80 text-sm">
                      If you request{" "}
                      <button
                        onClick={() => navigate('/data-deletion')}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        data deletion
                      </button>
                      , make sure you send the request using your own registered email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Commitment */}
              <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FiShield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">
                      Our Privacy Commitment:
                    </h4>
                    <ul className="text-green-200/80 text-sm space-y-1">
                      <li>• We never sell your personal data to third parties</li>
                      <li>• Your listening habits are kept confidential</li>
                      <li>• You have full control over your data and privacy settings</li>
                      <li>• We use industry-standard encryption to protect your information</li>
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

export default PrivacyPolicy;
