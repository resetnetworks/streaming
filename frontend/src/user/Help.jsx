import React, { useState } from "react";
import IconHeader from "../components/user/IconHeader";

const faqData = [
    {
        topic: "Account",
        questions: [
            {
                q: "What should I do if I forgot my password?",
                a: 'To reset your password, first log out of your account. Then, go to the login page and click on the "Reset Password" text located below the password field. Enter your email address and click the "Send Reset Link" button. A reset link will be sent to your email. Click on that link, create your new password, and submit it. Please make sure to do this only once.'
            },
            {
                q: "I made a payment but didn't receive the song or subscription. What should I do?",
                a: 'If you\'ve successfully completed a payment for a song or an artist subscription but haven\'t received access, please contact us immediately. Email us at <a href="mailto:contact@reset93.net" class="text-blue-400 hover:underline">contact@reset93.net</a> with the following:<br/><br/>- Your registered email or username<br/>- Payment proof (screenshot or transaction ID)<br/>- Name of the song or artist you paid for<br/><br/>We\'ll verify and resolve the issue as quickly as possible.'
            }
        ]
    },
    {
        topic: "Subscription",
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
        topic: "Technical Issues",
        questions: [
            {
    q: "My player is stuck in the loading state. What should I do?",
    a: "You need to click on a song to start playback. This is a common situation for new users — once you select a song, the player will activate and start working normally."
  }
        ]
    }
];

function Help() {
    const [selectedTopicIdx, setSelectedTopicIdx] = useState(null);
    const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(null);
    const [expandedTopics, setExpandedTopics] = useState([]);

    const renderContactInfo = () => (
        <div className="space-y-4">
  <h2 className="text-2xl font-semibold text-white">Contact & Information</h2>
  <p className="text-gray-200">
    We're here to help! Whether you have a question about your purchase, subscription, technical issue, or anything else, our support team is ready to assist you.
  </p>

  <p className="text-gray-300 italic">
    If you made a payment but didn’t receive the song or subscription access, please contact us with your payment proof. We'll resolve the issue as soon as possible.
  </p>

  <div className="space-y-3">
    <div>
      <h3 className="font-medium text-white">Email Support</h3>
      <a
        href="mailto:contact@reset93.net"
        className="text-blue-300 hover:text-blue-200 hover:underline transition-colors"
      >
        contact@reset93.net
      </a>
    </div>

    <div>
      <h3 className="font-medium text-white">Phone Support</h3>
      <a
        href="tel:+918392077241"
        className="text-blue-300 hover:text-blue-200 hover:underline transition-colors"
      >
        +918392077241
      </a>
    </div>
  </div>
</div>

    );

    const renderSelectedQuestion = () => {
        const topic = faqData[selectedTopicIdx];
        const question = topic.questions[selectedQuestionIdx];
        
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => {
                            setSelectedTopicIdx(null);
                            setSelectedQuestionIdx(null);
                        }}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-semibold text-white">{topic.topic}</h2>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-3">{question.q}</h3>
                    <div 
                        className="text-gray-200 space-y-3"
                        dangerouslySetInnerHTML={{ __html: question.a }}
                    />
                </div>
            </div>
        );
    };

    const leftBoxContent = selectedTopicIdx !== null && selectedQuestionIdx !== null 
        ? renderSelectedQuestion() 
        : renderContactInfo();

    const toggleTopic = (idx) => {
        setExpandedTopics(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
        if (expandedTopics.includes(idx)) {
            if (selectedTopicIdx === idx) {
                setSelectedTopicIdx(null);
                setSelectedQuestionIdx(null);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 px-2 md:px-4">
            {/* Header at the top */}
            <IconHeader />
            
            <div className="flex justify-center items-center flex-1 w-full py-8">
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
                    {/* Left/Main Box */}
                    <div className="text-white bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 lg:p-8 flex-1 min-w-0 min-h-[400px] max-h-[600px] flex flex-col overflow-auto transition-all duration-200">
                        {leftBoxContent}
                    </div>

                    {/* FAQ Box */}
                    <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-5 lg:p-6 flex-1 lg:max-w-[380px] min-h-[400px] max-h-[600px] flex flex-col overflow-auto">
                        <h3 className="text-white mb-5 font-semibold text-xl">Frequently Asked Questions</h3>
                        
                        <div className="space-y-3">
                            {faqData.map((topic, tIdx) => {
                                const expanded = expandedTopics.includes(tIdx);
                                return (
                                    <div key={topic.topic} className="mb-2">
                                        <button
                                            onClick={() => toggleTopic(tIdx)}
                                            className={`w-full text-left flex items-center justify-between rounded-lg font-medium px-4 py-3 transition-all ${
                                                expanded
                                                    ? "bg-blue-600/30 text-white"
                                                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                            }`}
                                        >
                                            <span className="font-medium">{topic.topic}</span>
                                            <span className="text-sm">
                                                {expanded ? "▲" : "▼"}
                                            </span>
                                        </button>
                                        
                                        {expanded && (
                                            <div className="mt-2 pl-2 space-y-2">
                                                {topic.questions.map((q, qIdx) => (
                                                    <button
                                                        key={qIdx}
                                                        onClick={() => {
                                                            setSelectedTopicIdx(tIdx);
                                                            setSelectedQuestionIdx(qIdx);
                                                        }}
                                                        className={`w-full text-left rounded-lg px-4 py-2.5 text-sm transition-all ${
                                                            selectedTopicIdx === tIdx && selectedQuestionIdx === qIdx
                                                                ? "bg-blue-500 text-white font-medium"
                                                                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                                        }`}
                                                    >
                                                        {q.q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Help;