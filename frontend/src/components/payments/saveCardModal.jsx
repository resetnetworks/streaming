import React, { useEffect, useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import axios from '../../utills/axiosInstance';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SaveCardForm = ({ artistId, onCardSaved, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchSetupIntent = async () => {
      try {
        const res = await axios.post('/subscriptions/setup-intent');
        setClientSecret(res.data.clientSecret);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to initialize card setup");
        setLoading(false);
      }
    };
    fetchSetupIntent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);

    const card = elements.getElement(CardElement);

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      console.error("❌ Card setup error:", result.error);
      toast.error("Card setup failed: " + result.error.message);
      setProcessing(false);
      return;
    }

    const paymentMethodId = result.setupIntent.payment_method;

    try {
      const res = await axios.post(`/subscriptions/artist/${artistId}`, {
        gateway: 'stripe',
        paymentMethodId,
      });

      const clientSecret = res.data.clientSecret;

      if (clientSecret) {
        const confirmRes = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethodId,
        });

        if (confirmRes.error) {
          toast.error("Payment failed: " + confirmRes.error.message);
          setProcessing(false);
          return;
        }

        toast.success("✅ Subscription and payment successful!");
      } else {
        toast.success("✅ Subscription successful without confirmation!");
      }

      onCardSaved?.();
      onClose?.();
    } catch (err) {
      console.error("❌ Subscription initiation failed:", err.response?.data || err.message);
      toast.error("Subscription failed. " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f3f4f6',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                  iconColor: '#6366f1',
                },
                invalid: {
                  color: '#f87171',
                  iconColor: '#f87171',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="text-sm text-gray-400">
          Your card will be saved for future payments. We don't store your card details directly.
        </p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          disabled={processing}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center transition-colors"
          disabled={processing}
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Save Card & Subscribe'}
        </button>
      </div>
    </form>
  );
};

const SaveCardModal = ({ artistId, onCardSaved, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-800">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Add Payment Method</h2>
              <p className="text-sm text-gray-400 mt-1">Secure payment processing via Stripe</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6">
            <Elements stripe={stripePromise}>
              <SaveCardForm artistId={artistId} onCardSaved={onCardSaved} onClose={onClose} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveCardModal;