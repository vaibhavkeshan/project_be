import mongoose from "mongoose";
const discoveryCallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
});
export const DiscoveryCall = new mongoose.model(
  "DiscoveryCall",
  discoveryCallSchema
);
