import React from "react";
import IconHeader from "../../components/user/IconHeader";
import PageSEO from "../../components/PageSeo/PageSEO";
import BackgroundWrapper from "../../components/BackgroundWrapper";
import Footer from "../../components/user/Footer";

const DataDeletion = () => {
  return (
    <>
    <PageSEO
  title="Data Deletion - Reset Music Streaming Account Guide"
description="Learn how to delete your Reset Music streaming account data & personal information. Simple 4-step process for complete data deletion."
  canonicalUrl="https://musicreset.com/data-deletion"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Data Deletion Instructions",
    "description": "Instructions for deleting personal data from Reset Music platform",
    "url": "https://musicreset.com/data-deletion",
    "publisher": {
      "@type": "Organization",
      "name": "Reset Music",
      "url": "https://musicreset.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@musicreset.com",
        "contactType": "customer support"
      }
    }
  }}
/>

      <BackgroundWrapper>
      <IconHeader />
      <div className="min-h-screen to-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">
            Data Deletion Instructions
          </h1>

          <p className="text-gray-300 mb-4">
            At <span className="font-semibold text-white">Music Reset</span>, we respect your privacy. If you've used Facebook or Google to sign in and wish to delete your account or any associated data, please follow the instructions below:
          </p>

          <div className="bg-gray-700 p-4 rounded-xl mb-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-200">
              <li>
                Send an email to{" "}
                <a
                  href="mailto:support@musicreset.com?subject=Data Deletion Request"
                  className="text-blue-400 font-medium hover:underline"
                >
                  support@musicreset.com
                </a>{" "}
                with the subject line: <span className="italic">"Data Deletion Request"</span>.
              </li>
              <li>
                In the email, include the email address or username linked to your Music Reset account.
              </li>
              <li>
                Make sure you send the request from the same email address you used to sign up.
              </li>
              <li>
                We will verify your identity and delete your data from our servers within 7 business days.
              </li>
            </ol>
          </div>

          <p className="text-sm text-gray-400 text-center mt-6">
            For additional support, contact us at{" "}
            <a
              href="mailto:support@musicreset.com?subject=Support Request"
              className="text-blue-400 hover:underline"
            >
              support@musicreset.com
            </a>
            . Please note that you must send the request using your own registered email address.
          </p>
        </div>
      </div>
      <Footer />
      </BackgroundWrapper>
    </>
  );
};

export default DataDeletion;
