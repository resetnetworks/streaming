import React, { useState } from "react";
import IconHeader from "../components/IconHeader";

const faqData = [
    {
        topic: "Account",
        questions: [
            {
                q: "How do I reset my password?",
                a: "Go to settings, select 'Change Password', and follow the instructions."
            },
            {
                q: "How do I update my email address?",
                a: "Navigate to your profile and click 'Edit Email'."
            }
        ]
    },
    {
        topic: "Subscription",
        questions: [
            {
                q: "How do I cancel my subscription?",
                a: "Visit the subscription page and click 'Cancel Subscription'."
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
                q: "The video is not loading. What should I do?",
                a: "Try refreshing the page or check your internet connection."
            }
        ]
    }
];

function Help() {
    const [selectedTopicIdx, setSelectedTopicIdx] = useState(null);
    const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(null);
    const [expandedTopics, setExpandedTopics] = useState([]);

    let leftBoxContent;
    if (
        selectedTopicIdx === null ||
        selectedQuestionIdx === null
    ) {
        leftBoxContent = (
            <div>
                <h2 className="text-2xl font-semibold mb-2">Contact & Information</h2>
                <p className="mb-2">
                    Need help? Reach out to our support team:
                </p>
                <ul className="mb-4">
                    <li>Email: <a className="text-blue-600 underline" href="mailto:support@example.com">support@example.com</a></li>
                    <li>Phone: <a className="text-blue-600 underline" href="tel:+1234567890">+1 234 567 890</a></li>
                </ul>
                <h3 className="text-lg font-semibold mb-1">Support Hours</h3>
                <p>Mon-Fri: 9am - 6pm</p>
            </div>
        );
    } else {
        const topic = faqData[selectedTopicIdx];
        const question = topic.questions[selectedQuestionIdx];
        leftBoxContent = (
            <div>
                <h2 className="text-2xl font-semibold mb-4">{topic.topic}</h2>
                <div className="font-bold mb-2">{question.q}</div>
                <div className="text-gray-600">{question.a}</div>
            </div>
        );
    }

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
        <div className="flex flex-col min-h-screen bg-gray-100 box-border bg-image px-2">
            {/* Header at the top */}
            <IconHeader />
            <div className="flex justify-center items-center flex-1 w-full">
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
                    {/* Left/Main Box */}
                    <div className="text-white backdrop-blur-xl bg-white/10  rounded-xl shadow-md p-6 md:p-10 flex-1 min-w-0 min-h-[350px] md:min-h-[420px] max-h-[600px] flex flex-col justify-start overflow-auto transition-all duration-200"
                        style={{ minWidth: 0 }}>
                        {leftBoxContent}
                    </div>

                    {/* FAQ Box */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-md p-4 flex-1 md:max-w-[340px] md:min-w-[260px] min-h-[350px] max-h-[600px] flex flex-col overflow-auto transition-all duration-200"
                        style={{ minWidth: 0 }}
                    >
                        <h3 className=" text-white mb-4 font-semibold text-lg">FAQs</h3>
                        <div>
                            {faqData.map((topic, tIdx) => {
                                const expanded = expandedTopics.includes(tIdx);
                                return (
                                    <div key={topic.topic} className="mb-4">
                                        <div
                                            onClick={() => toggleTopic(tIdx)}
                                            className={`cursor-pointer flex items-center justify-between rounded-md font-medium px-4 py-3 transition-colors ${
                                                expanded
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        >
                                            <span>{topic.topic}</span>
                                            <span className="text-xs">
                                                {expanded ? "▲" : "▼"}
                                            </span>
                                        </div>
                                        {expanded && (
                                            <div className="mt-2">
                                                {topic.questions.map((q, qIdx) => (
                                                    <div
                                                        key={qIdx}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setSelectedTopicIdx(tIdx);
                                                            setSelectedQuestionIdx(qIdx);
                                                        }}
                                                        className={`cursor-pointer rounded-md px-5 py-2 text-[15px] my-1 transition-colors ${
                                                            selectedTopicIdx === tIdx && selectedQuestionIdx === qIdx
                                                                ? "bg-blue-200 font-semibold"
                                                                : "bg-gray-50 hover:bg-blue-50 font-normal"
                                                        } text-gray-800`}
                                                    >
                                                        {q.q}
                                                    </div>
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
