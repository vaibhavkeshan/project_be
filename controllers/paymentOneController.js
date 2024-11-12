import { instance } from "../index.js";
import crypto from "crypto";
import { PaymentOneTime } from "../models/PaymentOneTime.js";
import { ProjectBuild } from "../models/ProjectBuild.js";
export const placeOrderOnline = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    console.log("totalAmount", totalAmount);
    const options = {
      amount: Number(totalAmount) * 100,
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(201).json({
      success: true,
      message: "payment request accept",
      order,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { p, razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(sign);
    const resultSign = hmac.digest("hex");

    const isAuthentic = resultSign === razorpay_signature;
    console.log(isAuthentic);

    if (isAuthentic) {
      const payment = await PaymentOneTime.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      const project = await ProjectBuild.findById(p._id);

      if (project) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        project.paidAt = new Date(Date.now());
        project.paymentInfo = payment._id;
        project.subscriptionId = {
          planId: payment._id,
          status: "active",
          expiryDate: expiryDate,
        };
        const projectData = await project.save();
        res.status(201).json({
          success: true,
          message: `Project is upgraded`,
          projectData,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: `Payment Failed`,
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};
