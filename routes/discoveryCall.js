import express from "express";
const router = express.Router();
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import {
  callRequestController,
  callRequestUpdateController,
  callDetailsController,
  callDeleteController,
} from "../controllers/discoveryCallController.js";
router.post("/callrequest", callRequestController);
router.put(
  "/callupdate/:id",
  isAuthenticated,
  isAdmin,
  callRequestUpdateController
);
router.get("/callDetails", isAuthenticated, isAdmin, callDetailsController);
router.delete(
  "/callDelete/:id",
  isAuthenticated,
  isAdmin,
  callDeleteController
);

export default router;
