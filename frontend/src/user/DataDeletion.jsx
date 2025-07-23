import React from "react";

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center px-4">
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
                href="mailto:contact@reset93.net?subject=Data Deletion Request"
                className="text-blue-400 font-medium hover:underline"
              >
                contact@reset93.net
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
            href="mailto:contact@reset93.net?subject=Support Request"
            className="text-blue-400 hover:underline"
          >
            contact@reset93.net
          </a>
          . Please note that you must send the request using your own registered email address.
        </p>
      </div>
    </div>
  );
};

export default DataDeletion;
