import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { paymentApi } from "../../api/paymentApi";
import { setStripeClientSecret } from "../../features/payments/paymentSlice";
import { toast } from "sonner";

/**
 * 🎯 One-time payment hook (fully dynamic)
 */
export const useCreatePayment = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: paymentApi.createPayment,

    onMutate: (variables) => {
      toast.loading(
        variables.gateway === "stripe"
          ? "Initializing secure checkout..."
          : `Redirecting to ${variables.gateway || "payment"}...`,
        { id: "payment" }
      );
    },

    onSuccess: (data) => {
      toast.dismiss("payment");

      // 💳 Embedded Checkout: Backend returned clientSecret
      if (data?.clientSecret) {
        dispatch(setStripeClientSecret(data.clientSecret));
        return;
      }

      // 🌐 Hosted Checkout Redirect: Fallback if backend returned checkoutUrl
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.error("Checkout details not received");
    },

    onError: (err) => {
      toast.dismiss("payment");
      toast.error(err?.response?.data?.message || "Payment failed");
    },
  });
};

/**
 * 🎯 Subscription payment hook (fully dynamic)
 */
export const useCreateSubscription = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: paymentApi.createSubscription,

    onMutate: (variables) => {
      toast.loading(
        variables.gateway === "stripe"
          ? "Initializing subscription checkout..."
          : `Redirecting to ${variables.gateway || "subscription"}...`,
        { id: "subscription" }
      );
    },

    onSuccess: (data) => {
      toast.dismiss("subscription");

      // 💳 Embedded Checkout: Backend returned clientSecret
      if (data?.clientSecret) {
        dispatch(setStripeClientSecret(data.clientSecret));
        return;
      }

      // 🌐 Hosted Checkout Redirect: Fallback if backend returned checkoutUrl
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.error("Subscription checkout details not received");
    },

    onError: (err) => {
      toast.dismiss("subscription");
      toast.error(err?.response?.data?.message || "Subscription failed");
    },
  });
};