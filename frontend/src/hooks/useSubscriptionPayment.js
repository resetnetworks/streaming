// src/hooks/useSubscriptionPayment.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initiateRazorpaySubscription,
  initiatePaypalSubscription,
  setPaymentGateway,
  setSubscriptionCycle
} from '../features/payments/paymentSlice';
import { toast } from 'sonner';

export const useSubscriptionPayment = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(null);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openSubscriptionOptions = (artist, cycle, subscriptionPrice) => {
    setPendingSubscription({ artist, cycle, subscriptionPrice });
    setShowSubscriptionOptions(true);
  };

  // ✅ UPDATED: Handle both regular method selection and PayPal with currency
  const handleSubscriptionMethodSelect = async (gateway, options = {}) => {
    if (!pendingSubscription) return;

    const { artist, cycle, subscriptionPrice } = pendingSubscription;
    setShowSubscriptionOptions(false);
    dispatch(setPaymentGateway(gateway));
    dispatch(setSubscriptionCycle(cycle));

    try {
      if (gateway === 'razorpay') {
        const razorpayResponse = await dispatch(initiateRazorpaySubscription({
          artistId: artist._id,
          cycle
        })).unwrap();

        if (razorpayResponse.success && razorpayResponse.subscriptionId) {
          openRazorpaySubscriptionCheckout(razorpayResponse, artist, cycle, subscriptionPrice);
        } else {
          throw new Error('Could not create Razorpay subscription.');
        }

      } else if (gateway === 'paypal') {
        // ✅ NEW: Extract PayPal plan details from options
        const { paypalPlan } = options;
        
        if (!paypalPlan) {
          throw new Error('PayPal plan information is missing.');
        }


        // ✅ NEW: Use selected PayPal plan for subscription
        const paypalResponse = await dispatch(initiatePaypalSubscription({
          artistId: artist._id,
          cycle,
          currency: paypalPlan.currency,
          paypalPlanId: paypalPlan.paypalPlanId,
          amount: paypalPlan.amount || subscriptionPrice
        })).unwrap();

        if (paypalResponse.success && paypalResponse.approveUrl) {
          // ✅ Store PayPal plan info in localStorage for callback handling
          localStorage.setItem('pendingPaypalSubscription', JSON.stringify({
            artistId: artist._id,
            artistName: artist.name,
            cycle,
            currency: paypalPlan.currency,
            amount: paypalPlan.amount || subscriptionPrice,
            paypalPlanId: paypalPlan.paypalPlanId
          }));
          
          window.location.href = paypalResponse.approveUrl;
        } else {
          throw new Error('PayPal subscription approval link not found.');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Subscription creation failed. Please try again.');
      setShowSubscriptionOptions(true);
      setPendingSubscription({ artist, cycle, subscriptionPrice });
    } finally {
      if (gateway !== 'paypal') {
        setPendingSubscription(null);
      }
    }
  };

  const openRazorpaySubscriptionCheckout = (subscriptionData, artist, cycle, subscriptionPrice) => {
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway is not available. Please refresh and try again.');
      return;
    }
 console.log(RAZORPAY_KEY)
    if (!RAZORPAY_KEY) {
      toast.error('Payment configuration error. Please contact support.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      subscription_id: subscriptionData.subscriptionId,
      name: 'MUSICRESET',
      description: `${artist.name} - ${cycle} Subscription`,
      handler: (response) => {
        toast.success(`Subscription created successfully! Subscription ID: ${response.razorpay_subscription_id}`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.phone || ''
      },
      notes: {
        artist_id: artist._id,
        artist_name: artist.name,
        subscription_cycle: cycle,
        user_id: currentUser?._id || 'guest'
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: () => {
          toast.info('Subscription was cancelled.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const errorMsg = response.error?.description || 'Please try again.';
        toast.error(`Subscription failed: ${errorMsg}`);
      });
      rzp.open();
    } catch (error) {
      toast.error('Failed to open subscription page. Please try again.');
    }
  };

  const closeSubscriptionOptions = () => {
    setShowSubscriptionOptions(false);
    setPendingSubscription(null);
  };

  return {
    showSubscriptionOptions,
    pendingSubscription,
    openSubscriptionOptions,
    handleSubscriptionMethodSelect,
    closeSubscriptionOptions
  };
};
