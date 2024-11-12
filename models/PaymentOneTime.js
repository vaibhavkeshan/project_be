import mongoose from "mongoose";
const paymentOneTimeSchema = new mongoose.Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
export const PaymentOneTime = new mongoose.model(
  "PaymentOneTime",
  paymentOneTimeSchema
);
