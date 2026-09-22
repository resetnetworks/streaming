import { loadStripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "⚠️ Stripe Publishable Key (VITE_STRIPE_PUBLISHABLE_KEY) is not defined in your .env file."
  );
}

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
