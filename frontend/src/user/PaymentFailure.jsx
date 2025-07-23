import { FaTimesCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const errorCode = queryParams.get('error_code') || 'DECLINED';
  const errorMessage = queryParams.get('message') || 'Payment could not be processed';
  const paymentMethod = queryParams.get('payment_method') || 'Credit Card';
  const type = queryParams.get('type'); // 'artist', 'song', or 'album'
  const amount = queryParams.get('amount');
  const id = queryParams.get('id');

  // Set failure details based on type
  let failureDetails = {
    title: "Payment Failed",
    description: `We couldn't process your payment of ₹${amount || '2,499.00'}. Please try again.`,
    actionText: "Try Payment Again",
    actionPath: "/checkout"
  };

  switch(type) {
    case 'artist':
      failureDetails.title = "Subscription Failed";
      failureDetails.description = `We couldn't activate your monthly subscription for ₹${amount}.`;
      failureDetails.actionText = "Retry Subscription";
      failureDetails.actionPath = `/artist/${id}?retry_payment=true`;
      break;
    case 'song':
      failureDetails.title = "Purchase Failed";
      failureDetails.description = `We couldn't process your song purchase for ₹${amount}.`;
      failureDetails.actionText = "Try Again";
      failureDetails.actionPath = `/song/${id}?retry_payment=true`;
      break;
    case 'album':
      failureDetails.title = "Purchase Failed";
      failureDetails.description = `We couldn't process your album purchase for ₹${amount}.`;
      failureDetails.actionText = "Try Again";
      failureDetails.actionPath = `/album/${id}?retry_payment=true`;
      break;
  }

  // Common error reasons mapping
  const errorReasons = {
    'card_declined': 'Card was declined',
    'expired_card': 'Card has expired',
    'insufficient_funds': 'Insufficient funds',
    'processing_error': 'Processing error',
    'DECLINED': 'Transaction declined',
    'authentication_required': 'Authentication required',
    'approve_with_id': 'Payment not approved',
    'call_issuer': 'Contact your card issuer',
    'incorrect_number': 'Incorrect card number',
    'invalid_account': 'Invalid account',
    'invalid_amount': 'Invalid amount',
    'invalid_cvc': 'Invalid CVC',
    'invalid_expiry_year': 'Invalid expiry year',
    'invalid_number': 'Invalid card number',
    'issuer_not_available': 'Card issuer unavailable'
  };

  useEffect(() => {
    // Show error toast when component mounts
    toast.error(failureDetails.title, {
      description: errorMessage,
      duration: 8000,
    });
  }, [failureDetails, errorMessage]);

  // Function to handle contact support click
  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Payment Failed - ${errorCode}`);
    const body = encodeURIComponent(
      `I encountered an issue while trying to make a payment:\n\n` +
      `- Error Code: ${errorCode}\n` +
      `- Error Message: ${errorMessage}\n` +
      `- Payment Type: ${type || 'Unknown'}\n` +
      `- Amount: ₹${amount || 'Unknown'}\n\n` +
      `Please assist with resolving this issue.`
    );
    window.location.href = `mailto:contact@reset93.net?subject=${subject}&body=${body}`;
  };

  // Format long error messages
  const formatErrorMessage = (msg) => {
    if (msg.length > 30) {
      return `${msg.substring(0, 30)}...`;
    }
    return msg;
  };

  return (
    <UserLayout>
      <UserHeader />
      <section className="bg-gradient-to-br from-black to-blue-950 min-h-screen w-full flex flex-col items-center text-white py-8 px-4">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="w-full flex flex-col items-center bg-gray-900 rounded-xl shadow-lg shadow-red-900/30 p-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-900/20 mb-6">
              <FaTimesCircle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-2xl md:text-3xl mb-2 text-center font-bold">
              {failureDetails.title.includes("Payment") ? (
                <>
                  {failureDetails.title.split(" ")[0]}{" "}
                  <span className="text-red-500">
                    {failureDetails.title.split(" ")[1]}
                  </span>
                </>
              ) : (
                failureDetails.title
              )}
            </h1>
            
            <p className="text-gray-400 mb-6 text-center text-sm md:text-base">
              {failureDetails.description}
            </p>
            
            <div className="w-full bg-gray-800 rounded-lg p-4 md:p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between mb-3 pb-2 border-b border-gray-700 gap-1">
                <span className="text-gray-400 text-sm">Error Code</span>
                <span className="font-medium text-sm md:text-base text-red-400">
                  {errorCode}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between mb-3 pb-2 border-b border-gray-700 gap-1">
                <span className="text-gray-400 text-sm">Reason</span>
                <span 
                  className="font-medium text-sm md:text-base text-right"
                  title={errorMessage}
                >
                  {errorReasons[errorCode.toLowerCase()] || formatErrorMessage(errorMessage)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-gray-400 text-sm">Payment Method</span>
                <span className="font-medium text-sm md:text-base">
                  {paymentMethod}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 w-full">
              <button
                onClick={() => navigate(failureDetails.actionPath)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-red-500/20"
              >
                {failureDetails.actionText}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-600 hover:bg-gray-800 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
            
            <p className="text-xs md:text-sm text-gray-500 mt-6 text-center">
              Need help?{" "}
              <button 
                onClick={handleContactSupport}
                className="text-red-400 hover:underline focus:outline-none"
              >
                Contact support
              </button>
            </p>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}