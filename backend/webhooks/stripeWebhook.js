import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe PaymentIntent with optional metadata.
 * @param {number} amount - in INR (e.g., 199).
 * @param {string} userId - MongoDB ObjectId.
 * @param {object} metadata - Optional: { itemType, itemId }.
 * @returns Stripe PaymentIntent
 */
export const createStripePaymentIntent = async (amount, userId, metadata = {}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe needs amount in paise
    currency: "INR",
    metadata: {
      userId,
      ...metadata,
    },
  });

  return paymentIntent;
};
