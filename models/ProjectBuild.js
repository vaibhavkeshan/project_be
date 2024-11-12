import mongoose from "mongoose";

const projectSchemaSchema = new mongoose.Schema(
  {
    target: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    content: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    targetMind: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    artWorkName: {
      type: String,
      required: true,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    isPlay: {
      type: Boolean,
      default: false,
    },
    mindArUpload: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["build", "approved", "reject", "pending"],
      default: "build",
    },
    height: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    builder: {
      type: Boolean,
      default: false,
    },
    paymentInfo: {
      type: mongoose.Schema.ObjectId,
      ref: "PaymentOneTime",
    },
    subscriptionInfo: {
      type: mongoose.Schema.ObjectId,
      ref: "Payment",
    },
    subscription: {
      id: String,
      status: String,
    },
    paidAt: Date,
    subscriptionId: {
      planId: {
        type: String,
      },
      status: {
        type: String,
        enum: ["create", "active", "expired"],
        default: "create",
      },
      expiryDate: {
        type: Date, // New field for expiry date
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export const ProjectBuild = new mongoose.model(
  "ProjectBuild",
  projectSchemaSchema
);
