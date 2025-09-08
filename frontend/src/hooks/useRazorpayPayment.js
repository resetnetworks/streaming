// src/hooks/useRazorpayPayment.js
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePaymentGateway } from './usePaymentGateway';

export const useRazorpayPayment = () => {
  const dispatch = useDispatch();
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const paymentLoading = useSelector(state => state.payment.loading);
  const paymentGateway = useSelector(state => state.payment.gateway);
  
  // Payment gateway hook को properly import करें
  const {
    showPaymentOptions,
    pendingPayment,
    openPaymentOptions,
    handlePaymentMethodSelect,
    closePaymentOptions
  } = usePaymentGateway();

  // ✅ handlePurchaseClick अब payment options modal खोलेगा
  const handlePurchaseClick = (item, itemType) => {
    openPaymentOptions(item, itemType);
  };

  return {
    handlePurchaseClick,
    processingPayment: processingPayment || paymentLoading,
    paymentLoading,
    paymentGateway,
    
    // Payment method selection states
    showPaymentOptions,
    pendingPayment,
    handlePaymentMethodSelect,
    closePaymentOptions
  };
};
