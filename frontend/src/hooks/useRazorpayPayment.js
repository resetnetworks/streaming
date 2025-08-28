// src/hooks/useRazorpayPayment.js
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { initiateRazorpayItemPayment, resetPaymentState } from "../features/payments/paymentSlice";
import { addPurchasedSong, addPurchasedAlbum } from "../features/auth/authSlice";
import { loadRazorpayScript } from "../utills/paymentHelpers";

export const useRazorpayPayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentRazorpayInstance, setCurrentRazorpayInstance] = useState(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const paymentLoading = useSelector((state) => state.payment.loading);

  const checkSubscriptionRequired = useCallback((item) => {
    if (currentUser?.role === "admin") return false;
    
    if (item.artist?.id || item.artist?._id) {
      const artistId = item.artist.id || item.artist._id;
      return !currentUser?.purchaseHistory?.some(
        purchase => 
          purchase.itemType === "artist-subscription" && 
          purchase.itemId === artistId
      );
    }
    return false;
  }, [currentUser]);

  const handleRazorpayCheckout = useCallback(async (order, item, type) => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'musicreset',
        description: `Purchase ${type}: ${item.title || item.name}`,
        image: `${window.location.origin}/icon.png`,
        handler: function () {
          if (currentRazorpayInstance) {
            try {
              currentRazorpayInstance.close();
            } catch {}
          }

          if (type === "song") {
            dispatch(addPurchasedSong(item._id));
          } else if (type === "album") {
            dispatch(addPurchasedAlbum(item._id));
          }

          toast.success(`Successfully purchased ${item.title || item.name}!`, { duration: 5000 });
          
          setProcessingPayment(false);
          setCurrentRazorpayInstance(null);
          dispatch(resetPaymentState());
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || ''
        },
        theme: { color: '#3b82f6' },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            setProcessingPayment(false);
            setCurrentRazorpayInstance(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      setCurrentRazorpayInstance(rzp);
      rzp.open();

    } catch {
      toast.error('Failed to open payment gateway');
      setProcessingPayment(false);
      setCurrentRazorpayInstance(null);
    }
  }, [currentUser, dispatch, currentRazorpayInstance]);

  const handlePurchaseClick = useCallback(async (item, type) => {
    if (!currentUser) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }

    const isPurchased = type === "song" 
      ? currentUser?.purchasedSongs?.includes(item._id)
      : currentUser?.purchasedAlbums?.includes(item._id);

    if (isPurchased) {
      toast.info("You have already purchased this item!");
      return;
    }

    if (checkSubscriptionRequired(item)) {
      return { requiresSubscription: true, artist: item.artist };
    }

    if (paymentLoading || processingPayment) {
      toast.info("Payment already in progress...");
      return;
    }

    try {
      setProcessingPayment(true);
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Coerce price to a number (rupees) before sending to backend
      const rupees = Number(item.price);
      if (!Number.isFinite(rupees) || rupees <= 0) {
        throw new Error("Invalid item price for payment");
      }
      
      const result = await dispatch(initiateRazorpayItemPayment({
        itemType: type,
        itemId: item._id,
        amount: rupees // backend should convert to paise as per Razorpay docs
      })).unwrap();

      if (result.order) {
        await handleRazorpayCheckout(result.order, item, type);
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment');
      setProcessingPayment(false);
    }

    return { requiresSubscription: false };
  }, [currentUser, paymentLoading, processingPayment, dispatch, navigate, checkSubscriptionRequired, handleRazorpayCheckout]);

  return {
    handlePurchaseClick,
    processingPayment,
    paymentLoading,
    checkSubscriptionRequired
  };
};
