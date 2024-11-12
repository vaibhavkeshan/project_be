import { User } from "../models/User.js";
import { ProjectBuild } from "../models/ProjectBuild.js";
import { instance } from "../index.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
export const buySubscriptionController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const project = await ProjectBuild.findById(req.params.id);

    if (user.role === "admin") {
      return res.status(404).send({
        success: false,
        message: "Admin can`t buy subscription",
      });
    }
    const plan_id = process.env.PLAN_ID || "plan_Np3Kp88tWQGF3q";
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      // quantity: 1,
      total_count: 1,
    });
    project.subscription.id = subscription.id;
    project.subscription.status = subscription.status;

    await project.save();
    res.status(201).send({
      success: true,
      message: "subscription is created successfully",
      subscription: subscription.id,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const paymentVerificationController = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      p,
    } = req.body;

    const project = await ProjectBuild.findById(p._id);
    const subscription_id = project.subscription.id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");

    const isAuthentic = generated_signature == razorpay_signature;

    // if (!isAuthentic) {
    //   return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    // }
    // return res.send({ check: "true", isAuthentic, project, subscription_id });

    if (isAuthentic) {
      const payment = await Payment.create({
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
      });

      if (project) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        project.paidAt = new Date(Date.now());
        project.subscriptionInfo = payment._id;
        project.subscriptionId = {
          planId: payment._id,
          status: "active",
          expiryDate: expiryDate,
        };
        project.subscription.status = "Completed";
        const projectData = await project.save();
        console.log(projectData, "vishal kumar yadav");
        res.status(201).json({
          success: true,
          message: `Project is upgraded`,
          projectData,
        });
      }
    }

    // res.redirect(
    //   `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    // );
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const getRazorPayKeyController = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const cancelSubscriptionController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
    let refund = false;
    await instance.subscriptions.cancel(subscriptionId);
    const payment = await Payment.findOne({
      razorpay_subscription_id: subscriptionId,
    });
    const gap = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAY * 24 * 60 * 60 * 1000;
    if (refundTime > gap) {
      await instance.payments.refund(payment.razorpay_payment_id);
      refund = true;
    }
    await payment.remove();
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();

    res.status(200).send({
      success: true,
      message: refund
        ? "subscription canceled you will received full refund within seven days"
        : "subscription canceled ,Now refund imitated as subscription was cancelled after 7  days",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
