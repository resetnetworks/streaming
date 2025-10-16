// src/pages/CancellationRefundPolicy.jsx
import React, { useState } from "react";
import { FiX, FiAlertTriangle, FiClock, FiShield, FiHome, FiHelpCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Footer from "../components/user/Footer";
import IconHeader from "../components/user/IconHeader";
import useNavigation from "../hooks/useAuthNavigation";
import PageSEO from "../components/PageSeo/PageSEO";


const CancellationRefundPolicy = () => {
  const navigate = useNavigate();
  const { navigateToHome } = useNavigation();
  const [activeTab, setActiveTab] = useState('cancellation');

  const cancellationSteps = [
    {
      step: 1,
      title: "Visit Artist Profile",
      description: "Navigate to the artist's profile page that you want to cancel your subscription for."
    },
    {
      step: 2,
      title: "Find Cancel Button",
      description: "Look for the 'Cancel Subscription' button on the artist's profile page."
    },
    {
      step: 3,
      title: "Confirm Cancellation",
      description: "Click the button and follow the prompts to confirm your cancellation."
    },
    {
      step: 4,
      title: "Access Continues",
      description: "You'll retain access to the content until the end of your current billing period."
    }
  ];

  const importantPoints = [
    {
      icon: FiXCircle,
      title: "No Refunds Policy",
      description: "Reset Music has a strict 'no refund' policy for subscriptions and content purchases. You will not receive money back for any period already paid.",
      type: "warning"
    },
    {
      icon: FiCheckCircle,
      title: "Access Until Period Ends",
      description: "When you cancel, you'll continue to have access to the creator's content until the end of the billing period you've already paid for.",
      type: "info"
    },
    {
      icon: FiClock,
      title: "Cancel Before Next Cycle",
      description: "To avoid being charged again, cancel before your next billing cycle begins. This prevents future automatic payments.",
      type: "success"
    }
  ];

  const faqs = [
    {
      question: "When should I cancel to avoid the next charge?",
      answer: "Cancel before your next billing cycle starts. You can find your next billing date in your account settings or subscription details."
    },
    {
      question: "Will I get a refund if I cancel immediately?",
      answer: "No, Reset Music has a strict no-refund policy. You will not receive money back for any period you have already paid for."
    },
    {
      question: "What happens to my access after cancellation?",
      answer: "You will retain access to the subscribed content until the end of your current billing period. After that, access will be removed."
    },
    {
      question: "Can I reactivate my subscription later?",
      answer: "Yes, you can resubscribe to any artist at any time by visiting their profile and selecting a subscription plan."
    },
    {
      question: "How do I know my cancellation was successful?",
      answer: "You should receive a confirmation message after cancellation, and the subscription status will update in your account settings."
    }
  ];

  return (
    <>

    <PageSEO
  title="Cancellation & Refund - Reset Music Streaming Policy"
  description="Learn how to cancel Reset Music streaming subscriptions & understand our refund policy. Step-by-step cancellation guide & policy details."
  canonicalUrl="https://musicreset.com/cancellation-refund-policy"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cancellation & Refund Policy",
    "description": "Reset Music cancellation and refund policy page with step-by-step cancellation guide",
    "url": "https://musicreset.com/cancellation-refund-policy",
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
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-blue-900/30 border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-red-600/20 rounded-xl border border-red-500/30">
                  <FiX className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-800 via-red-400 to-red-700 bg-clip-text text-transparent">
                  Cancellation & Refund Policy
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Everything you need to know about cancelling subscriptions and our refund policy
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  <span>Last updated: September 29, 2025</span>
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
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setActiveTab('cancellation')}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                  activeTab === 'cancellation'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                Cancellation Process
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                  activeTab === 'policy'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                Policy Details
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                  activeTab === 'faq'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                FAQ
              </button>
            </div>
          </div>

          {/* Cancellation Process Tab */}
          {activeTab === 'cancellation' && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">How to Cancel Your Subscription</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Follow these simple steps to cancel any artist subscription on Reset Music
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cancellationSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 relative"
                  >
                    <div className="absolute -top-3 left-6">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="pt-4">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Notice */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <FiAlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-300 mb-2">
                      Important: Cancel Before Next Billing Cycle
                    </h4>
                    <p className="text-amber-200/80 text-sm">
                      To stop future payments, it's best to cancel before your next billing cycle begins. You'll continue to have access to the content until the end of the period you've already paid for.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policy Details Tab */}
          {activeTab === 'policy' && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Policy Details</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Understanding Reset Music's cancellation and refund policies
                </p>
              </div>

              <div className="space-y-6">
                {importantPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-6 ${
                      point.type === 'warning' 
                        ? 'bg-red-900/20 border-red-500/30' 
                        : point.type === 'success'
                        ? 'bg-green-900/20 border-green-500/30'
                        : 'bg-blue-900/20 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        point.type === 'warning'
                          ? 'bg-red-500/20'
                          : point.type === 'success'
                          ? 'bg-green-500/20'
                          : 'bg-blue-500/20'
                      }`}>
                        <point.icon className={`w-6 h-6 ${
                          point.type === 'warning'
                            ? 'text-red-400'
                            : point.type === 'success'
                            ? 'text-green-400'
                            : 'text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {point.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Policy Text */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Complete Policy Statement</h3>
                <div className="prose prose-invert max-w-none space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Reset Music subscriptions can be cancelled at any time to prevent future charges by visiting the Artist's profile and clicking on 'Cancel Subscription' button, but all purchases and subscriptions are non-refundable, meaning you will not receive a refund for any money already paid.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    To stop future payments, it is best to cancel before the next billing cycle begins.
                  </p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-white mb-3">Important Cancellation Information:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-3">
                        <FiXCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                        <span><strong>No Refunds:</strong> Reset Music has a strict "no refund" policy for subscriptions and content purchases. You are entitled to cancel at any time, but you will not get money back for any period you have already paid for.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span><strong>Access Continues:</strong> When you cancel a subscription, you will generally have access to the creator's content until the end of the billing period for which you have already paid.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiClock className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <span><strong>Best Practice:</strong> To avoid being charged again, it is recommended to disable the auto-renew option before your next billing cycle starts.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Common questions about cancellations and refunds
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                          <FiHelpCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            {faq.question}
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">Still Have Questions?</h3>
              <p className="text-gray-300">
                If you need help with cancellation or have questions about our refund policy, we're here to help.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Reset Music Support Team</p>
                <a
                  href="mailto:contact@reset93.net?subject=Cancellation and Refund Policy Inquiry"
                  className="text-blue-400 hover:underline"
                >
                  contact@reset93.net
                </a>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CancellationRefundPolicy;
