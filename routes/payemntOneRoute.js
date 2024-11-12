import express from "express";
import {
  placeOrderOnline,
  paymentVerification,
} from "../controllers/paymentOneController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/createorderonline", isAuthenticated, placeOrderOnline);

router.post("/paymentverification", isAuthenticated, paymentVerification);

export default router;
