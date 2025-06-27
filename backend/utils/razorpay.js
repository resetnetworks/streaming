import Razorpay from "razorpay";

const razorpay = new Razorpay({
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
export const createRazorpayOrder = async (amount, userId, metadata = {}) => {
  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId,
      ...metadata,
    },
  });

  return order;
};
