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
    amount: amount * 100,
    currency: "inr", // ✅ Lowercase is required
    description: "Artist Subscription Payment",
    statement_descriptor: "Streamify Music",
    shipping: {
      name: "Test User",
      address: {
        line1: "123 Test Street",
        postal_code: "123456",
        city: "Mumbai",
        state: "MH",
        country: "IN",
      },
    },
    metadata: {
      userId: String(userId),
      ...Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v)])
      ),
    },
  });

  return paymentIntent;
};

