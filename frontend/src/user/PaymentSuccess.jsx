import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-br from-black to-blue-950 min-h-screen w-full justify-center flex flex-col items-center text-white">
      
      <div className=" mt-8 w-full flex justify-center">
        <div className="subscription-card md:w-[28rem] py-8 px-6 w-[90vw] flex flex-col items-center bg-gray-900 rounded-xl shadow-lg shadow-blue-900/30">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/20 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl mb-2 text-center">
            Payment <span className="text-blue-500">Successful!</span>
          </h1>
          <p className="text-gray-400 mb-8 text-center">
            Your transaction of ₹2,499.00 has been completed successfully.
          </p>
          
          <div className="w-full bg-gray-800 rounded-lg p-5 mb-8">
            <div className="flex justify-between mb-3 pb-2 border-b border-gray-700">
              <span className="text-gray-400">Transaction ID</span>
              <span className="font-medium">TXN76489302</span>
            </div>
            <div className="flex justify-between mb-3 pb-2 border-b border-gray-700">
              <span className="text-gray-400">Date & Time</span>
              <span className="font-medium">20 Jun, 2023 - 14:32</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-medium">Credit Card (**** 4242)</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 w-full">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/20"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-600 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            A receipt has been sent to your registered email address.
          </p>
        </div>
      </div>
    </section>
  );
}