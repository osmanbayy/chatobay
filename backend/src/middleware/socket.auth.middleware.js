import jwt from "jsonwebtoken";
import User from "../models/User.js"
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie?.split("; ").find(row => row.startsWith("jwt="))?.split("=")[1];
    if (!token) {
      console.error("Socket connection rejected: No token provided.");
      return next(new Error("Unauthorized - No token provided."));
    }

    // verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.error("Socket connection rejected: Invalid token.");
      return next(new Error("Unauthorized - Invalid token."));
    }

    // find the user from database
    const user = await User.findById(decoded.userId).select("-password -verificationCode -verificationCodeExpiresAt");
    if (!user) {
      console.error("Socket connection rejected: User not found.");
      return next(new Error("Unauthorized - User not found."));
    }

    if (!user.isVerified) {
      console.error("Socket connection rejected: Email not verified.");
      return next(new Error("Unauthorized - Email not verified."));
    }

    if (!user.onboardingCompleted) {
      console.error("Socket connection rejected: Onboarding incomplete.");
      return next(new Error("Unauthorized - Onboarding incomplete."));
    }

    // attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);

    next();
  } catch (error) {
    console.error("Error in socket authentication: ", error.message);
    next(new Error("Unauthorized - Authentication failed."));
  }
}