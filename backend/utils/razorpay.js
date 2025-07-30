import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order with optional metadata.
 * @param {number} amount - in INR (e.g., 199).
 * @param {string} userId - MongoDB ObjectId.
 * @param {object} metadata - Optional: { itemType, itemId }.
 * @returns Razorpay Order
 */
export const createRazorpayOrder = async (amount, userId, itemType, itemId, metadata = {}) => {
  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId,
      itemType,
      itemId,
      ...metadata,
    },
  });

  return order;
};


/**
 * ✅ Create Razorpay subscription plan (one-time per artist)
 */
export const createRazorpayPlan = async (artistName, amountInRupees) => {
  const plan = await razorpay.plans.create({
    period: "monthly", // or weekly/yearly
    interval: 1,
    item: {
      name: `Subscription for ${artistName}`,
      amount: amountInRupees * 100, // in paise
      currency: "INR",
    },
  });

  return plan.id;
};

