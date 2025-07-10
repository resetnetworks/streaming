import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import {
  initiateArtistPayment,
  initiateStripeItemPayment,
  resetPaymentState,
} from '../../features/payments/paymentSlice';

import {
  selectClientSecret,
  selectPaymentLoading,
  selectPaymentError,
} from '../../features/payments/paymentSelectors';

const CheckoutForm = ({ type, id, amount, clientSecret, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const error = useSelector(selectPaymentError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) throw stripeError;

      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.();
        navigate(`/payment-success?type=${type}&id=${id}&amount=${amount}&payment_intent=${paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Stripe Payment Error:', err);
      navigate(`/payment-fail?error_code=${err.code || 'error'}&message=${err.message}&type=${type}&id=${id}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-600 rounded-lg p-3 bg-gray-800">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': { color: '#a0aec0' },
                iconColor: '#ffffff',
              },
              invalid: { color: '#ef4444' },
            },
            hidePostalCode: true,
          }} 
        />
      </div>

      {error && <div className="text-red-400 text-sm mt-2">{error.message}</div>}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`flex-1 py-2 px-4 rounded-md font-medium ${
            processing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {processing ? 'Processing...' : `Pay ₹${amount}`}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-4 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const StripePayment = ({ type, id, amount, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const clientSecret = useSelector(selectClientSecret);
  const loading = useSelector(selectPaymentLoading);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      setStripePromise(stripe);
    };
    initializeStripe();
  }, []);

  useEffect(() => {
    const initiate = async () => {
      try {
        let res;
        if (type === 'artist') {
          res = await dispatch(initiateArtistPayment({ artistId: id })).unwrap();
        } else if (type === 'song' || type === 'album') {
          res = await dispatch(initiateStripeItemPayment({
            itemType: type,
            itemId: id,
            amount,
          })).unwrap();
        }

        if (!res || !res.clientSecret) {
          throw new Error('Invalid response from server');
        }

        // Optional: mark that payment is in progress
        sessionStorage.setItem('paymentInProgress', 'true');
      } catch (err) {
        toast.error('Failed to initiate payment');
        console.error('Payment initiation error:', err);
      }
    };

    initiate();
    return () => {
      dispatch(resetPaymentState());
      sessionStorage.removeItem('paymentInProgress');
    };
  }, [dispatch, type, id, amount]);

  if (!stripePromise) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="stripe-payment-container p-6 bg-gray-900 rounded-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-white mb-2">
        {type === 'artist' ? 'Artist Subscription' : `${type.charAt(0).toUpperCase() + type.slice(1)} Purchase`}
      </h3>
      <p className="text-gray-300 mb-4">
        {type === 'artist' ? 'Monthly subscription' : 'One-time purchase'}
      </p>
      <p className="text-2xl font-bold text-white mb-6">₹{amount}</p>

      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#1f2937',
                colorText: '#f3f4f6',
                colorDanger: '#ef4444',
              },
            },
          }}
          key={clientSecret} // ✅ Ensures remounting on new clientSecret to avoid mutation error
        >
          <CheckoutForm
            type={type}
            id={id}
            amount={amount}
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      ) : (
        <div className="flex justify-center items-center h-32">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          ) : (
            <p className="text-gray-400">Unable to initialize payment</p>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>Secure payments processed by Stripe</p>
        <div className="flex items-center justify-center mt-2 space-x-2">
          <img 
            src="https://js.stripe.com/v3/fingerprinted/img/visa-4d88440930cdf6e8e2f8b925adf6c3df.svg" 
            alt="Visa" 
            className="h-6"
          />
          <img 
            src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d88440930cdf6e8e2f8b925adf6c3df.svg" 
            alt="Mastercard" 
            className="h-6"
          />
          <img 
            src="https://js.stripe.com/v3/fingerprinted/img/amex-4d88440930cdf6e8e2f8b925adf6c3df.svg" 
            alt="American Express" 
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
};

export default StripePayment;
