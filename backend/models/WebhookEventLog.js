// models/WebhookEventLog.js
import mongoose from "mongoose";

const webhookEventLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const WebhookEventLog =
  mongoose.models.WebhookEventLog ||
  mongoose.model("WebhookEventLog", webhookEventLogSchema);
