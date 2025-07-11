import React, { useEffect, useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import axios from '../../utills/axiosInstance';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// 👉 Pass artistId as prop
const SaveCardForm = ({ artistId, onCardSaved, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  // STEP 1: Fetch setup intent from backend
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

  // STEP 2: Handle Stripe card setup and backend subscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      console.error("❌ Card setup error:", result.error);
      toast.error("Card setup failed: " + result.error.message);
      return;
    }

    const paymentMethodId = result.setupIntent.payment_method;

    try {
      // STEP 3: Initiate artist subscription using saved card
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
    return;
  }

  toast.success("✅ Subscription and payment successful!");
} else {
  toast.success("✅ Subscription successful without confirmation!");
}

    } catch (err) {
      console.error("❌ Subscription initiation failed:", err.response?.data || err.message);
      toast.error("Subscription failed. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-3 bg-gray-800 rounded" />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Card & Subscribe
        </button>
        <button type="button" onClick={onClose} className="bg-gray-700 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
};

const SaveCardModal = ({ artistId, onCardSaved, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-white text-xl font-semibold mb-4">Save Card for Subscription</h2>
        <Elements stripe={stripePromise}>
          <SaveCardForm artistId={artistId} onCardSaved={onCardSaved} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};

export default SaveCardModal;
