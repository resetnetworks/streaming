import React from "react";
import { Helmet } from "react-helmet";  

const PrivacyPolicy = () => {
  return (
    <>
    <Helmet>
      <title>Privacy Policy | RESET MUSIC STREAMING PLATFORM</title>
      <meta name="robots" content="index, follow" />
<meta name="description" content="Learn how RESET Music collects, uses, and protects your personal data while you stream ambient, instrumental, and experimental music." />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-5xl w-full bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-400 text-center mb-8">
          Effective Date: 24 July 2025 &nbsp;|&nbsp; Last Updated: 25 July 2025
        </p>

        {/* Intro */}
        <section className="mb-6">
          <p className="text-gray-300">
            Welcome to <span className="font-semibold text-white">Reset</span> — a music streaming platform designed for immersive, vocal-free experiences powered by cutting-edge audio technology. Your privacy is important to us. This Privacy Policy outlines how we collect, use, share, and protect your personal data when you use our services.
          </p>
        </section>

        {/* 1. What We Collect */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">1. What We Collect</h2>
          <p className="text-gray-300 font-medium mb-1">a. Account Information</p>
          <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Phone number (if provided)</li>
            <li>Payment details (via PayU, Razorpay, etc.)</li>
          </ul>

          <p className="text-gray-300 font-medium mb-1">b. Usage Data</p>
          <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">
            <li>Tracks streamed, playlists, likes, listening habits</li>
            <li>Device and browser type</li>
            <li>IP address and approximate location</li>
            <li>Log data like access times, pages viewed</li>
          </ul>

          <p className="text-gray-300 font-medium mb-1">c. Cookies & Tracking</p>
          <p className="text-gray-300">
            We use cookies and tools (e.g., Google Analytics) to personalize your experience and analyze usage.
          </p>
        </section>

        {/* 2. How We Use */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>To provide and enhance our services</li>
            <li>To personalize content and recommendations</li>
            <li>To facilitate payments and subscriptions</li>
            <li>To send service updates, offers, or notices</li>
            <li>To secure the platform and prevent abuse</li>
          </ul>
        </section>

        {/* 3. Sharing */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">3. Sharing & Disclosure</h2>
          <p className="text-gray-300">
            We do not sell your personal data. However, we may share data with:
          </p>
          <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
            <li>Service Providers (e.g., payments, analytics)</li>
            <li>Law enforcement (if legally required)</li>
            <li>Affiliated partners under strict confidentiality</li>
          </ul>
        </section>

        {/* 4. Security */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">4. Data Security</h2>
          <p className="text-gray-300">
            We implement strong technical and organizational security measures including:
          </p>
          <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
            <li>End-to-end encryption for sensitive data</li>
            <li>Secure servers and access control</li>
            <li>Regular audits and compliance reviews</li>
          </ul>
        </section>

        {/* 5. Your Rights */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">5. Your Rights</h2>
          <p className="text-gray-300 mb-2">Depending on your region, you may have the right to:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>Access or export your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Object to specific processing</li>
            <li>Unsubscribe from promotional emails</li>
          </ul>
          <p className="text-gray-300 mt-2">
            To exercise any of these rights, email us at:{" "}
            <a
              href="mailto:privacy@reset93.net?subject=Privacy Rights Request"
              className="text-blue-400 hover:underline"
            >
              contact@reset93.net
            </a>
          </p>
        </section>

        {/* 6. Children */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">6. Children’s Privacy</h2>
          <p className="text-gray-300">
            Reset is not intended for users under 13. We do not knowingly collect data from children.
          </p>
        </section>

        {/* 7. International Users */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">7. International Users</h2>
          <p className="text-gray-300">
            If you access Reset from outside India, your data may be processed and stored in India or other countries. By using our service, you consent to such transfers.
          </p>
        </section>

        {/* 8. Changes */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">8. Changes to this Policy</h2>
          <p className="text-gray-300">
            We may update this Privacy Policy occasionally. The updated version will be posted here with a new "Last Updated" date. Continued use of the service implies acceptance.
          </p>
        </section>

        {/* 9. Contact */}
        <section className="mb-2">
          <h2 className="text-xl font-semibold text-white mb-2">9. Contact Us</h2>
          <p className="text-gray-300 mb-1">Reset Networks Studios</p>
          <p className="text-gray-300 mb-1">
            Website:{" "}
            <a href="https://musicreset.com" className="text-blue-400 hover:underline">
              musicreset.com
            </a>
          </p>
          <p className="text-gray-300">
            Email:{" "}
            <a
              href="mailto:contact@reset93.net"
              className="text-blue-400 hover:underline"
            >
              contact@reset93.net
            </a>
          </p>
        </section>

        <p className="text-sm text-gray-500 text-center mt-8">
          Note: If you request <a href="/data-deletion" className="text-blue-400 underline">data deletion</a>, make sure you send the request using your own registered email.
        </p>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
