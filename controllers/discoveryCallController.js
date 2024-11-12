import { DiscoveryCall } from "../models/DiscoveryCall.js";

export const callRequestController = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(409).send({
        success: false,
        message: "All fields are necessary",
      });
    }
    const callRequest = await DiscoveryCall.create({
      name,
      email,
      phone,
    });
    res.status(201).send({
      success: true,
      message: "call request is accepted",
      callRequest,
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};

export const callRequestUpdateController = async (req, res) => {
  try {
    const callRequest = await DiscoveryCall.findById(req.params.id);
    if (!callRequest) {
      return res.status(404).send({
        success: false,
        message: "invalid id",
      });
    }
    if (callRequest.status === "no") {
      callRequest.status = "yes";
    } else {
      callRequest.status = "no";
    }
    await callRequest.save();
    res.status(201).send({
      success: true,
      message: "status is updated",
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};

export const callDetailsController = async (req, res) => {
  try {
    const callRequest = await DiscoveryCall.find({});
    if (callRequest.length === 0 || !callRequest) {
      return res.status(404).send({
        success: false,
        message: "no any request",
      });
    }

    res.status(200).send({
      success: true,
      message: "all call request is fetched",
      callRequest,
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};
export const callDeleteController = async (req, res) => {
  try {
    const deletedCall = await DiscoveryCall.findByIdAndDelete(req.params.id);
    if (!deletedCall) {
      return res.status(404).send({
        success: false,
        message: "Call not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "call is deleted",
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      e,
    });
  }
};
