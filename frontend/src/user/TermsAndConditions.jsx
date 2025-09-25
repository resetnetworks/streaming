// src/pages/TermsAndConditions.jsx
import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiBookOpen, FiShield, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Footer from "../components/user/Footer";
import IconHeader from "../components/user/IconHeader";
import useNavigation from "../hooks/useAuthNavigation";
import PageSEO from "../components/SEO/PageSEO";


const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);
  const {navigateToHome} = useNavigation();

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const termsData = [
    {
      id: "introduction",
      title: "A. Introduction",
      content: `This Agreement governs your use of the Reset Music Streaming Platform ("Service"), which allows streaming, purchasing, licensing, or subscribing to digital audio, video, and interactive content ("Content"). By creating an account or using the Service, you accept and agree to this Agreement and all related policies.`
    },
    {
      id: "payments",
      title: "B. Payments, Taxes, and Refunds",
      content: `Transactions for Content or subscriptions may be free or paid. All paid Transactions are final unless technical issues prevent access, in which case a replacement or refund may be provided. Prices and applicable taxes may vary and are subject to change. Failure to pay may result in suspension or termination of access.`
    },
    {
      id: "account",
      title: "C. Account",
      content: `Users must provide accurate registration details and meet minimum age requirements. Account security is the user's responsibility. Reset Music is not liable for unauthorized access or use resulting from failure to secure credentials. Accounts for minors must be created or supervised by a parent or guardian.`
    },
    {
      id: "privacy",
      title: "D. Privacy",
      content: `All personal information collected is governed by Reset Music's Privacy Policy, which complies with applicable privacy laws. Users should review the Privacy Policy regularly; continued use after changes constitutes acceptance.`
    },
    {
      id: "accessibility",
      title: "E. Accessibility",
      content: `Reset Music endeavors to make the Service accessible to users with disabilities and offers accommodations upon request through support channels.`
    },
    {
      id: "usage-rules",
      title: "F. Services and Content Usage Rules",
      content: `• The Service and Content are licensed only for personal, non-commercial streaming use.
• Downloading or saving tracks is prohibited; Content is only available for streaming.
• Any attempt to bypass or circumvent restrictions on downloading will result in termination.
• Users may not manipulate metrics such as play counts, ratings, or other engagement measures.
• Streaming limits and simultaneous device restrictions may apply.
• Users are responsible for compliant use; content availability may vary due to licensing.`
    },
    {
      id: "termination",
      title: "G. Termination and Suspension of Services",
      content: `Reset Music may suspend or terminate user access or Service availability at any time without notice for violations, suspected fraud, or other reasons. Payment responsibilities remain in effect despite termination.`
    },
    {
      id: "downloads",
      title: "H. Downloads",
      content: `Currently, users cannot download any Content from the Service. All access is streaming only, and any claims or offers to the contrary are null. Users should not expect offline access or local storage of the Content.`
    },
    {
      id: "subscriptions",
      title: "I. Subscriptions",
      content: `Subscriptions auto-renew until cancelled via account settings. Price changes will be communicated, and continuation requires user consent where required by law. Free trials, where offered, are subject to terms limiting reactivation or combination with other promos.`
    },
    {
      id: "content-availability",
      title: "J. Content and Service Availability",
      content: `Content rights vary by region and may be removed or restricted. Use outside licensed territories may be blocked or limited. Content availability is dynamic and subject to change.`
    },
    {
      id: "third-party",
      title: "K. Third-Party Devices and Equipment",
      content: `Some Service features may depend on device compatibility. Use on non-standard devices may be unsupported. Users accept any restrictions or limitations arising from third-party equipment.`
    },
    {
      id: "submissions",
      title: "L. Your Submissions",
      content: `User-generated content (comments, playlists, reviews) is subject to guidelines prohibiting illegal, offensive, or infringing material. Users grant Reset Music a royalty-free license to use submissions for operation, promotion, or improvement of the Service.`
    },
    {
      id: "family-sharing",
      title: "M. Family Sharing",
      content: `Family Sharing allows subscription sharing with defined member limits. Organizers are responsible for family members' usage and payments. Certain subscriptions may be eligible for sharing; others are not.`
    },
    {
      id: "additional-terms",
      title: "N. Additional Terms",
      content: `Additional terms may apply for promotions, partnerships, or third-party content. Users must comply with those separate agreements where applicable.`
    },
    {
      id: "miscellaneous",
      title: "O. Miscellaneous Provisions",
      content: `Reset Music may update these Terms from time to time, with continued use constituting acceptance. This Agreement is governed by the laws of the jurisdiction of Reset Music's registration. Intellectual property rights are retained exclusively by Reset Music and licensors. No warranties of uninterrupted service are implied, and liability is limited to the extent allowed by law.`
    }
  ];

  const tableOfContents = [
    "A. Introduction",
    "B. Payments, Taxes, and Refunds", 
    "C. Account",
    "D. Privacy",
    "E. Accessibility",
    "F. Services and Content Usage Rules",
    "G. Termination and Suspension of Services",
    "H. Downloads",
    "I. Subscriptions",
    "J. Content and Service Availability",
    "K. Third-Party Devices and Equipment",
    "L. Your Submissions",
    "M. Family Sharing",
    "N. Additional Terms",
    "O. Miscellaneous Provisions"
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <PageSEO 
        title="Terms and Conditions - Reset Streaming Platform | Reset Music"
        description="Read the Terms and Conditions for using the Reset Music Streaming Platform by Reset Music. Understand your rights and responsibilities and more."
        url="https://musicreset.com/terms-and-conditions"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
        <IconHeader />
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-blue-900/30 border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <FiBookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-800 via-blue-400 to-blue-700 bg-clip-text text-transparent">
                  Terms and Conditions
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Please read these terms carefully before using the Reset Music Streaming Platform
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  <span>Last updated: September 17, 2025</span>
                </div>
              </div>

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

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-blue-400" />
                    Table of Contents
                  </h2>
                  
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => {
                      const sectionId = termsData[index]?.id;
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
                {termsData.map((section, index) => (
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
                              <p
                                key={pIndex}
                                className="text-gray-300 leading-relaxed mb-4 last:mb-0"
                              >
                                {paragraph.startsWith('•') ? (
                                  <span className="flex items-start gap-3">
                                    <span className="text-blue-400 mt-2">•</span>
                                    <span>{paragraph.substring(1).trim()}</span>
                                  </span>
                                ) : (
                                  paragraph
                                )}
                              </p>
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
                  <h3 className="text-2xl font-bold text-white">Questions About These Terms?</h3>
                  <p className="text-gray-300">
                    If you have any questions about these Terms and Conditions, please contact us.
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Reset Music Streaming Platform</p>
                    <a
              href="mailto:contact@reset93.net?subject=Terms and Conditions Inquiry"
              className="text-blue-400 hover:underline"
            >
              contact@reset93.net
            </a>
                  </div>
                </div>
              </div>

              {/* Agreement Acknowledgment */}
              <div className="mt-8 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <FiShield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-300 mb-2">
                      By using Reset Music, you acknowledge that:
                    </h4>
                    <ul className="text-amber-200/80 text-sm space-y-1">
                      <li>• You have read and understood these Terms and Conditions</li>
                      <li>• You agree to be bound by these terms</li>
                      <li>• You are of legal age to enter into this agreement</li>
                      <li>• You will use the service in compliance with all applicable laws</li>
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

export default TermsAndConditions;
