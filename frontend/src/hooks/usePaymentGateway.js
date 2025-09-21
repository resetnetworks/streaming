// src/hooks/usePaymentGateway.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  initiateRazorpayItemPayment,
  initiatePaypalItemPayment,
  setPaymentGateway 
} from '../features/payments/paymentSlice';
import { addPurchase } from '../features/auth/authSlice'; // ✅ Import the existing action
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

  // ✅ Updated to accept currency data
  const openPaymentOptions = (item, itemType, currencyData = null) => {
    setPendingPayment({ 
      item, 
      itemType, 
      currencyData // Store currency data
    });
    setShowPaymentOptions(true);
  };

  // ✅ Updated to handle currency data
  const handlePaymentMethodSelect = async (gateway) => {
    if (!pendingPayment) return;

    const { item, itemType, currencyData } = pendingPayment;
    
    // ✅ Close payment options modal immediately
    setShowPaymentOptions(false);
    dispatch(setPaymentGateway(gateway));

    // ✅ Get payment details based on currency data or fallback
    const getPaymentDetails = () => {
      if (currencyData) {
        return {
          amount: currencyData.amount,
          currency: currencyData.currency,
          symbol: currencyData.symbol
        };
      }
      
      // Fallback to basePrice if available
      if (item?.basePrice) {
        return {
          amount: item.basePrice.amount,
          currency: item.basePrice.currency,
          symbol: getCurrencySymbol(item.basePrice.currency)
        };
      }
      
      // Legacy fallback
      return {
        amount: item?.price || 0,
        currency: 'USD',
        symbol: '₹'
      };
    };

    const paymentDetails = getPaymentDetails();

    try {
      if (gateway === 'razorpay') {
        // ✅ Pass currency data to Razorpay
        const razorpayResponse = await dispatch(initiateRazorpayItemPayment({
          itemType,
          itemId: item._id,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency
        })).unwrap();
        
        if (razorpayResponse.success && razorpayResponse.order) {
          openRazorpayCheckout(razorpayResponse.order, item, itemType, paymentDetails);
        } else {
          throw new Error('Could not create Razorpay order.');
        }

      } else if (gateway === 'paypal') {
        // ✅ Pass currency data to PayPal
        const paypalResponse = await dispatch(initiatePaypalItemPayment({
          itemType,
          itemId: item._id,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency
        })).unwrap();

        const approveLink = paypalResponse?.links?.find(link => link.rel === 'approve');
        
        if (approveLink?.href) {
          // ✅ Store payment details for callback handling
          localStorage.setItem('pendingPaypalPayment', JSON.stringify({
            itemId: item._id,
            itemType,
            itemTitle: item.title,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            symbol: paymentDetails.symbol
          }));
          
          window.location.href = approveLink.href;
        } else {
          throw new Error('PayPal approval link not found.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      
      // ✅ Re-open payment options on error
      setShowPaymentOptions(true);
      setPendingPayment({ item, itemType, currencyData });
    } finally {
      // ✅ Clear pending payment for successful flows
      if (gateway !== 'paypal') {
         setPendingPayment(null);
      }
    }
  };

  // ✅ Updated to use currency data with Redux state update
  const openRazorpayCheckout = (order, item, itemType, paymentDetails) => {
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
      currency: order.currency || paymentDetails.currency || 'USD',
      name: 'MUSICRESET',
      description: `Purchase: ${item.title}`,
      order_id: order.id,
      handler: (response) => {
        // ✅ Update Redux state immediately after successful payment
        dispatch(addPurchase({
          itemType,
          itemId: item._id
        }));

        toast.success(
          `Payment successful! Payment ID: ${response.razorpay_payment_id}`,
          {
            description: `Paid ${paymentDetails.symbol}${paymentDetails.amount} for ${item.title}`
          }
        );

        // ✅ Optional: Remove the automatic page reload to see immediate state update
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2000);
      },
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.phone || ''
      },
      notes: {
        item_id: item._id,
        item_type: itemType,
        item_title: item.title,
        user_id: currentUser?._id || 'guest',
        currency: paymentDetails.currency,
        original_amount: paymentDetails.amount
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
      console.error('Razorpay error:', error);
      toast.error('Failed to open payment page. Please try again.');
    }
  };

  // ✅ Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
      'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  // ✅ Enhanced close function
  const closePaymentOptions = () => {
    setShowPaymentOptions(false);
    setPendingPayment(null);
  };

  // ✅ Helper function to get payment display info
  const getPaymentDisplayInfo = () => {
    if (!pendingPayment) return null;

    const { item, currencyData } = pendingPayment;
    
    if (currencyData) {
      return {
        amount: currencyData.amount,
        currency: currencyData.currency,
        symbol: currencyData.symbol,
        displayPrice: `${currencyData.symbol}${currencyData.amount}`,
        isBaseCurrency: currencyData.isBaseCurrency
      };
    }
    
    if (item?.basePrice) {
      const symbol = getCurrencySymbol(item.basePrice.currency);
      return {
        amount: item.basePrice.amount,
        currency: item.basePrice.currency,
        symbol,
        displayPrice: `${symbol}${item.basePrice.amount}`,
        isBaseCurrency: true
      };
    }
    
    return {
      amount: item?.price || 0,
      currency: 'USD',
      symbol: '₹',
      displayPrice: `₹${item?.price || 0}`,
      isBaseCurrency: true
    };
  };

  return {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect,
    closePaymentOptions,
    getPaymentDisplayInfo // ✅ Export helper function
  };
};
