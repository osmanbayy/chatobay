import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create reusable transporter object using SMTP transport
// Singleton pattern - aynı transporter'ı tekrar kullan
let transporterInstance = null;

export const createTransporter = () => {
  // Eğer zaten bir transporter varsa, onu kullan (connection pooling için)
  if (transporterInstance) {
    return transporterInstance;
  }

  const isProduction = ENV.NODE_ENV === "production";
  
  transporterInstance = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: parseInt(ENV.SMTP_PORT) || 587,
    secure: ENV.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASSWORD,
    },
    // Production için optimize edilmiş ayarlar
    connectionTimeout: 10000, // 10 saniye
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // Brevo için ek ayarlar
    tls: {
      rejectUnauthorized: !isProduction, // Production'da false, development'ta true
      minVersion: 'TLSv1.2',
    },
    // Connection pooling için
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Debug modu (sadece development için)
    debug: !isProduction,
    logger: !isProduction,
  });

  // Bağlantıyı test et (sadece development için)
  if (!isProduction) {
    transporterInstance.verify((error, success) => {
      if (error) {
        console.error("SMTP connection error:", error);
      } else {
        console.log("SMTP server is ready to send emails");
        console.log("SMTP Config:", {
          host: ENV.SMTP_HOST,
          port: ENV.SMTP_PORT,
          user: ENV.SMTP_USER,
          from: ENV.EMAIL_FROM
        });
      }
    });
  }

  return transporterInstance;
};

export const sender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME
};

