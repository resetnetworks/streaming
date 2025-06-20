import { FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();
  
  // Function to handle contact support click
  const handleContactSupport = () => {
    window.location.href = "mailto:info@reset93.net?subject=Payment Fail Issue";
  };

  return (
    <section className="bg-gradient-to-br from-black to-blue-950 min-h-screen w-full justify-center flex flex-col items-center text-white">
      
      <div className="mt-8 w-full flex justify-center">
        <div className="subscription-card md:w-[28rem] py-8 px-6 w-[90vw] flex flex-col items-center bg-gray-900 rounded-xl shadow-lg shadow-red-900/30">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-900/20 mb-6">
            <FaTimesCircle className="h-12 w-12 text-red-500" />
          </div>
          
          <h1 className="text-3xl mb-2 text-center">
            Payment <span className="text-red-500">Failed</span>
          </h1>
          <p className="text-gray-400 mb-8 text-center">
            We couldn't process your payment of ₹2,499.00. Please try again.
          </p>
          
          <div className="w-full bg-gray-800 rounded-lg p-5 mb-8">
            <div className="flex justify-between mb-3 pb-2 border-b border-gray-700">
              <span className="text-gray-400">Error Code</span>
              <span className="font-medium text-red-400">DECLINED</span>
            </div>
            <div className="flex justify-between mb-3 pb-2 border-b border-gray-700">
              <span className="text-gray-400">Reason</span>
              <span className="font-medium">Insufficient Funds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-medium">Credit Card (**** 4242)</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 w-full">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-red-500/20"
            >
              Try Payment Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-600 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
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
  );
}