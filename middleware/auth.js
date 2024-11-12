import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    // console.log(req.cookies.token);
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "not logged in",
      });
    }

    const decoded = jwt.verify(
      token || req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = await User.findById(decoded._id);
    console.log("req.user", decoded._id);
    next();
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "internal server errors",
      e,
    });
  }
};

export const isSubscribed = async (req, res, next) => {
  try {
    if (
      req.user.subscription.status !== "Completed" ||
      req.user.role !== "admin"
    ) {
      return res.status(401).send({
        success: false,
        message: "not Subscribed",
      });
    }

    next();
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "internal server errors",
      e,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).send({
        success: false,
        message: "you are not authorized",
      });
    }
    next();
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
