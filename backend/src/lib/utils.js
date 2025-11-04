import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, response) => {
  const { JWT_SECRET, NODE_ENV } = ENV;
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured.");

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  response.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevent XSS Attacks
    sameSite: "strict",
    secure: NODE_ENV === "development" ? false : true
  });

  return token;
}