import cron from "node-cron";
import { ProjectBuild } from "../models/ProjectBuild.js";

export const startCronJob = () => {
  // Define the cron job
  cron.schedule("0 0 * * *", async () => {
    try {
      const currentDate = new Date();
      // Find and update projects whose subscription has expired
      await ProjectBuild.updateMany(
        {
          "subscriptionId.status": "active",
          "subscriptionId.expiryDate": { $lte: currentDate },
        },
        {
          $set: { "subscriptionId.status": "expired" },
          "subscriptionId.planId": undefined,
        }
      );
      console.log("Subscription status updated successfully");
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  });
};
