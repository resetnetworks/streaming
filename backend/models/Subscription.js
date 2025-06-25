import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    isRecurring: {
      type: Boolean,
      default: true, // set to false if user cancels auto-renew
    },
    gateway: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },
    externalSubscriptionId: {
      type: String, // Stripe subscription ID or Razorpay subscription ID
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique: a user can have only one active subscription per artist
subscriptionSchema.index({ userId: 1, artistId: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
