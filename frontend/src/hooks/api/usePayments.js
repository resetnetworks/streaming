import { useMutation } from "@tanstack/react-query";
import { paymentApi } from "../../api/paymentApi";
import { toast } from "sonner";

/**
 * 🎯 One-time payment hook (fully dynamic)
 */
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: paymentApi.createPayment,

    onMutate: (variables) => {
      toast.loading(
        `Redirecting to ${variables.gateway || "payment"}...`,
        { id: "payment" }
      );
    },

    onSuccess: (data) => {
      toast.dismiss("payment");

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Checkout URL not received");
      }
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
  return useMutation({
    mutationFn: paymentApi.createSubscription,

    onMutate: (variables) => {
      toast.loading(
        `Redirecting to ${variables.gateway || "subscription"}...`,
        { id: "subscription" }
      );
    },

    onSuccess: (data) => {
      toast.dismiss("subscription");

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Subscription checkout failed");
      }
    },

    onError: (err) => {
      toast.dismiss("subscription");
      toast.error(err?.response?.data?.message || "Subscription failed");
    },
  });
};