// src/components/PayPalSuccessHandler.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addPurchase } from '../features/auth/authSlice';
import { toast } from 'sonner';

const PayPalSuccessHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for PayPal success callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const PayerID = urlParams.get('PayerID');
    
    // Check if there's a pending PayPal payment
    const pendingPayment = localStorage.getItem('pendingPaypalPayment');
    
    if (pendingPayment && (paymentId || PayerID)) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        
        // ✅ Update Redux state immediately
        dispatch(addPurchase({
          itemType: paymentData.itemType,
          itemId: paymentData.itemId
        }));
        
        toast.success('Payment successful!', {
          description: `Paid ${paymentData.symbol}${paymentData.amount} for ${paymentData.itemTitle}`
        });
        
        // Clean up
        localStorage.removeItem('pendingPaypalPayment');
        
        // Redirect to home or item page
        setTimeout(() => {
          window.location.href = '/home';
        }, 2000);
        
      } catch (error) {
        console.error('Error processing PayPal success:', error);
        localStorage.removeItem('pendingPaypalPayment');
      }
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default PayPalSuccessHandler;
