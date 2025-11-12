import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create reusable transporter object using SMTP transport
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASSWORD,
    },
  });
};

export const sender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME
};

