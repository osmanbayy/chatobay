import { ENV } from "../lib/env.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (request, response, next) => {
  try {
    const token = request.cookies.jwt;
    if (!token) return response.status(400).json({ message: "Unauthorized - No token provided." });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) return response.status(400).json({ message: "Unauthorized - Invalid token." });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return response.status(404).json({ message: "User not found." });

    request.user = user;

    next();

  } catch (error) {
    console.log("Error in protectRoute middlewarte: ", error);
    response.status(500).json({ message: "Internal server error." });

  }
}