import React, { useEffect } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { stripePromise } from "../../utills/stripe";
import { closeStripeModal } from "../../features/payments/paymentSlice";

export default function StripeCheckoutModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  clientSecret: propClientSecret,
}) {
  const dispatch = useDispatch();
  const reduxClientSecret = useSelector((state) => state.payment?.clientSecret);

  // Support both controlled props and global Redux state
  const clientSecret = propClientSecret !== undefined ? propClientSecret : reduxClientSecret;
  const isOpen = propIsOpen !== undefined ? Boolean(propIsOpen && clientSecret) : Boolean(clientSecret);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(closeStripeModal());
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !clientSecret) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 bg-white/90 hover:bg-gray-100 shadow-sm transition-all focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Embedded Stripe Checkout */}
        {!stripePromise ? (
          <div className="p-8 text-center text-rose-500 text-sm">
            Stripe publishable key is missing. Please check your environment configuration.
          </div>
        ) : (
          <div id="checkout" className="w-full mt-2 mb-5">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}
