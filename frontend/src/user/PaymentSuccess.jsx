import { FaCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import UserLayout from "../components/user/UserLayout";
import UserHeader from "../components/user/UserHeader";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const payment_intent = queryParams.get('payment_intent');
  const type = queryParams.get('type'); // 'artist', 'song', or 'album'
  const id = queryParams.get('id');
  const amount = queryParams.get('amount');

  // Format current date and time using vanilla JS
  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Set payment details based on type
  let paymentDetails = {
    title: "Payment Successful!",
    description: `Your transaction of ₹${amount || '0.00'} has been completed successfully.`,
    actionText: "Back to Artist",
    actionPath: type === 'artist' ? `/artist/${id}` : '/'
  };

  switch(type) {
    case 'artist':
      paymentDetails.title = "Subscription Activated!";
      paymentDetails.description = `Your monthly subscription for ₹${amount} has been activated successfully.`;
      paymentDetails.actionText = "Go to Artist Page";
      break;
    case 'song':
      paymentDetails.title = "Song Purchased!";
      paymentDetails.description = `You've successfully purchased this song for ₹${amount}.`;
      paymentDetails.actionText = "View Your Purchases";
      paymentDetails.actionPath = "/Purchases";
      break;
    case 'album':
      paymentDetails.title = "Album Purchased!";
      paymentDetails.description = `You've successfully purchased this album for ₹${amount}.`;
      paymentDetails.actionText = "View Your Purchases";
      paymentDetails.actionPath = "/Purchases";
      break;
  }

  useEffect(() => {
    // Show toast on mount
    toast.success(paymentDetails.title, {
      description: paymentDetails.description,
    });

    // Update localStorage for artist subscriptions
    if (type === 'artist' && id && typeof window !== 'undefined') {
      let subscribedArtists = [];
      try {
        subscribedArtists = JSON.parse(localStorage.getItem('subscribedArtists')) || [];
      } catch (error) {
        console.error("Error parsing subscribed artists:", error);
        subscribedArtists = [];
      }

      if (!subscribedArtists.includes(id)) {
        try {
          localStorage.setItem(
            'subscribedArtists',
            JSON.stringify([...subscribedArtists, id])
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }
    }
  }, [type, id, paymentDetails]);

  // Format long payment intent ID
  const formatPaymentId = (id) => {
    if (!id) return 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (id.length > 16) {
      return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
    }
    return id;
  };

  return (
    <UserLayout>
      <UserHeader />
      <section className="bg-gradient-to-br from-black to-blue-950 min-h-screen w-full flex flex-col items-center text-white py-8 px-4">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="w-full flex flex-col items-center bg-gray-900 rounded-xl shadow-lg shadow-blue-900/30 p-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/20 mb-6">
              <FaCheckCircle className="h-12 w-12 text-green-500" />
            </div>

            <h1 className="text-2xl md:text-3xl mb-2 text-center font-bold">
              {paymentDetails.title.includes("Payment") ? (
                <>
                  {paymentDetails.title.split(" ")[0]}{" "}
                  <span className="text-blue-500">
                    {paymentDetails.title.split(" ")[1]}
                  </span>
                </>
              ) : (
                paymentDetails.title
              )}
            </h1>

            <p className="text-gray-400 mb-6 text-center text-sm md:text-base">
              {paymentDetails.description}
            </p>

            <div className="w-full bg-gray-800 rounded-lg p-4 md:p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between mb-3 pb-2 border-b border-gray-700 gap-1">
                <span className="text-gray-400 text-sm">Transaction ID</span>
                <span className="font-medium text-sm md:text-base truncate" title={payment_intent}>
                  {formatPaymentId(payment_intent)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between mb-3 pb-2 border-b border-gray-700 gap-1">
                <span className="text-gray-400 text-sm">Date & Time</span>
                <span className="font-medium text-sm md:text-base">{currentDate}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-gray-400 text-sm">Payment Method</span>
                <span className="font-medium text-sm md:text-base">Credit Card (via Stripe)</span>
              </div>
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <button
                onClick={() => navigate(paymentDetails.actionPath)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/20"
              >
                {paymentDetails.actionText}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-600 hover:bg-gray-800 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition-all duration-300"
              >
                Back to Home
              </button>
            </div>

            <p className="text-xs md:text-sm text-gray-500 mt-6 text-center">
              {type === 'artist' ? (
                "Your subscription will automatically renew each month. You can cancel anytime."
              ) : (
                "Please keep a screenshot or note of this transaction for your records."
              )}
            </p>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}