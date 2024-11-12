import express from "express";
const router = express.Router();
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import {
  buySubscriptionController,
  paymentVerificationController,
  getRazorPayKeyController,
  cancelSubscriptionController,
} from "../controllers/paymentController.js";

router.get("/subscribe/:id", isAuthenticated, buySubscriptionController);
// verify payment and save reference in database
router.post(
  "/paymentverification",
  isAuthenticated,
  paymentVerificationController
);

// get Razorpay key
router.get("/razorpaykey", getRazorPayKeyController);
router.delete(
  "/subscribe/cancel",
  isAuthenticated,
  cancelSubscriptionController
);
export default router;
