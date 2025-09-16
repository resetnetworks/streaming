// src/hooks/usePaymentGateway.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  initiateRazorpayItemPayment,
  initiatePaypalItemPayment,
  setPaymentGateway 
} from '../features/payments/paymentSlice';
import { toast } from 'sonner';

export const usePaymentGateway = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openPaymentOptions = (item, itemType) => {
    setPendingPayment({ item, itemType });
    setShowPaymentOptions(true);
  };

  const handlePaymentMethodSelect = async (gateway) => {
    if (!pendingPayment) return;

    const { item, itemType } = pendingPayment;
    setShowPaymentOptions(false);
    dispatch(setPaymentGateway(gateway));

    try {
      if (gateway === 'razorpay') {
        const razorpayResponse = await dispatch(initiateRazorpayItemPayment({
          itemType,
          itemId: item._id,
          amount: item.price
        })).unwrap();
        
        if (razorpayResponse.success && razorpayResponse.order) {
          openRazorpayCheckout(razorpayResponse.order, item, itemType);
        } else {
          throw new Error('Could not create Razorpay order.');
        }

      } else if (gateway === 'paypal') {
        const paypalResponse = await dispatch(initiatePaypalItemPayment({
          itemType,
          itemId: item._id,
          amount: item.price,
          currency: 'USD'
        })).unwrap();

        const approveLink = paypalResponse?.links?.find(link => link.rel === 'approve');
        
        if (approveLink?.href) {
          window.location.href = approveLink.href;
        } else {
          throw new Error('PayPal approval link not found.');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setShowPaymentOptions(true);
      setPendingPayment({ item, itemType });
    } finally {
      if (gateway !== 'paypal') {
         setPendingPayment(null);
      }
    }
  };

  const openRazorpayCheckout = (order, item, itemType) => {
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway is not available. Please refresh and try again.');
      return;
    }

    if (!RAZORPAY_KEY) {
      toast.error('Payment configuration error. Please contact support.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'MUSICRESET',
      description: `Purchase: ${item.title}`,
      order_id: order.id,
      handler: (response) => {
        toast.success(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      // ⭐ यहाँ बदलाव किए गए हैं
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.phone || ''
      },
      notes: {
        item_id: item._id,
        item_type: itemType,
        item_title: item.title,
        user_id: currentUser?._id || 'guest'
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: () => {
          toast.info('Payment was cancelled.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const errorMsg = response.error?.description || 'Please try again.';
        toast.error(`Payment failed: ${errorMsg}`);
      });
      rzp.open();
    } catch (error) {
      toast.error('Failed to open payment page. Please try again.');
    }
  };

  const closePaymentOptions = () => {
    setShowPaymentOptions(false);
    setPendingPayment(null);
  };

  return {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect,
    closePaymentOptions
  };
};