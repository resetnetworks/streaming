import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">
          Privacy Policy
        </h1>

        {/* Section: Information Collection */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            What type of information do we collect?
          </h2>
          <p className="text-gray-300">
            We collect and store any information you enter on our website or provide us in other ways. This includes:
            IP address, login details, email address, password, computer/device information, and purchase history. We may use tools to collect data such as session duration, page interaction, and browsing behavior. Personal data may include name, email, payment info, comments, feedback, and profile preferences.
          </p>
        </section>

        {/* Section: Collection Methods */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How do we collect the information?
          </h2>
          <p className="text-gray-300">
            When you interact with our website (e.g., during transactions), we collect the personal data you voluntarily give, such as your name, email, or address. This data is only used for the purposes mentioned in this policy.
          </p>
        </section>

        {/* Section: Why We Collect */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Why do we collect such information?
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>To provide and operate our platform</li>
            <li>To assist users with customer support</li>
            <li>To send service-related and promotional messages</li>
            <li>To analyze usage and improve user experience</li>
            <li>To comply with legal obligations and regulations</li>
          </ul>
        </section>

        {/* Section: Consent Withdrawal */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How can site visitors withdraw their consent?
          </h2>
          <p className="text-gray-300 mb-2">
            If you wish to withdraw your consent, please email us at{" "}
            <a
              href="mailto:contact@reset93.net?subject=Withdraw Consent Request"
              className="text-blue-400 hover:underline"
            >
              contact@reset93.net
            </a>{" "}
          </p>
        </section>

        {/* Section: Policy Updates */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">
            Privacy Policy Updates
          </h2>
          <p className="text-gray-300">
            We may update this policy anytime. Changes will take effect
            immediately upon posting. Significant updates will be notified on
            this page so you're aware of what information we collect and how
            it's used.
          </p>
        </section>

        <p className="text-sm text-gray-500 text-center mt-8">
          Note: If a user requests <a href="/data-deletion" className="text-blue-500 underline">data deletion</a>, you must send the request email using your own email account.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
