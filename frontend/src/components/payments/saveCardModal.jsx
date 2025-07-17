import React, { useEffect, useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import {
  initiateStripeSetupIntent,
  confirmArtistStripeSubscription,
  resetPaymentState,
} from '../../features/payments/paymentSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SaveCardForm = ({ artistId, onCardSaved, onClose }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const { clientSecret, loading, error } = useSelector((s) => s.payment);
  const [processing, setProcessing] = useState(false);

  /* Local card preview states */
  const [cardBrand, setCardBrand] = useState('');
  const [last4, setLast4]         = useState('');

  useEffect(() => {
    dispatch(initiateStripeSetupIntent());
    return () => dispatch(resetPaymentState());
  }, [dispatch]);

  useEffect(() => {
    if (!elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    card.on('change', (e) => {
      if (e.complete) {
        setCardBrand(e.brand || '');
        setLast4(e.value?.last4 || '');
      } else {
        setCardBrand('');
        setLast4('');
      }
    });
  }, [elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    const card = elements.getElement(CardElement);

    const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
      clientSecret,
      { payment_method: { card } }
    );

    if (setupError) {
      toast.error('Card setup failed: ' + setupError.message);
      setProcessing(false);
      return;
    }

    const paymentMethodId = setupIntent.payment_method;

    try {
      const res = await dispatch(
        confirmArtistStripeSubscription({ artistId, paymentMethodId })
      ).unwrap();

      if (res.clientSecret) {
        const confirmRes = await stripe.confirmCardPayment(res.clientSecret, {
          payment_method: paymentMethodId,
        });

        if (confirmRes.error) {
          toast.error('Payment failed: ' + confirmRes.error.message);
          setProcessing(false);
          return;
        }
      }

      toast.success('Subscription successful!');
      onCardSaved?.();
      onClose?.();
    } catch (err) {
      toast.error('Subscription failed. ' + (err.message || ''));
    } finally {
      setProcessing(false);
    }
  };

  /* ----------  UI ---------- */

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-sm p-4 text-center">
        Failed to initialise payment. Please try again later.
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Security badge */}
      <div className="flex items-center space-x-2 text-xs text-green-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Your card details are encrypted & never stored by us</span>
      </div>

      {/* Card input */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Card Details
        </label>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 focus-within:border-indigo-500 transition">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f3f4f6',
                  '::placeholder': { color: '#9ca3af' },
                  iconColor: '#6366f1',
                },
                invalid: { color: '#f87171' },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        {cardBrand && last4 && (
          <p className="text-xs text-gray-400 mt-1">
            {cardBrand.toUpperCase()} •••• {last4}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        We will only charge you after confirming your subscription. Your card is saved securely with Stripe.
      </p>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
        >
          {processing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing…
            </>
          ) : (
            'Save Card & Subscribe'
          )}
        </button>
      </div>

      {/* Stripe footer */}
      <div className="text-center text-xs text-gray-500 mt-4">
        Secured by{' '}
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-300"
        >
          Stripe
        </a>
      </div>
    </form>
  );
};

const SaveCardModal = ({ artistId, onCardSaved, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-black/80 to-black/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/95 border border-gray-700/60 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">Add Payment Method</h2>
            <p className="text-sm text-gray-400 mt-1">
              Secure subscription via Stripe
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <Elements stripe={stripePromise}>
            <SaveCardForm
              artistId={artistId}
              onCardSaved={onCardSaved}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>

      {/* Global animation styles (add once in your Tailwind config or root CSS) */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SaveCardModal;