import React, { useEffect, useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addPurchase } from "../../features/auth/authSlice";
import {
  initiateStripeItemPayment,
  resetPaymentState,
} from "../../features/payments/paymentSlice";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const OneTimePaymentForm = ({ itemType, itemId, amount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const { clientSecret, loading, error } = useSelector((state) => state.payment);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(initiateStripeItemPayment({ itemType, itemId, amount }));
    return () => {
      dispatch(resetPaymentState());
    };
  }, [itemType, itemId, amount, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    const card = elements.getElement(CardElement);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      toast.error("Payment failed: " + result.error.message);
      setProcessing(false);
      return;
    }

    toast.success("✅ Payment successful!");
    dispatch(addPurchase({ itemType, itemId }));
    onSuccess?.();
    onClose?.();
    setProcessing(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-sm p-4 text-center">
        Failed to initialize payment. Try again later.
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
                  fontSize: "16px",
                  color: "#f3f4f6",
                  "::placeholder": { color: "#9ca3af" },
                  iconColor: "#6366f1",
                },
                invalid: { color: "#f87171", iconColor: "#f87171" },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="text-sm text-gray-400">
          Complete payment securely via Stripe.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="btn-gray" disabled={processing}>
          Cancel
        </button>
        <button type="submit" className="btn-indigo" disabled={processing}>
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            `Pay ₹${amount}`
          )}
        </button>
      </div>
    </form>
  );
};

const OneTimePaymentModal = ({ itemType, itemId, amount, onSuccess, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-800">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Complete Your Purchase</h2>
              <p className="text-sm text-gray-400 mt-1">Secure one-time payment</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6">
            <Elements stripe={stripePromise}>
              <OneTimePaymentForm
                itemType={itemType}
                itemId={itemId}
                amount={amount}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneTimePaymentModal;
