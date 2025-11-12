import { createTransporter, sender } from "../lib/nodemailer.js";
import { createVerificationEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  let transporter;
  try {
    transporter = createTransporter();
    
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to ChatObay",
      html: createWelcomeEmailTemplate(name, clientURL),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome Email Sent Successfully.", info.messageId);
    console.log("Email sent to:", email);
    return info;
  } catch (error) {
    console.error("Error sending welcome email: ", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      to: email,
      from: sender.email,
      host: process.env.SMTP_HOST
    });
    
    const errorMessage = error.response 
      ? `SMTP Error: ${error.response}` 
      : error.message || "Unknown SMTP error";
    
    throw new Error(`Failed to send welcome email: ${errorMessage}`);
  }
};

export const sendVerificationEmail = async (email, name, code, clientURL) => {
  let transporter;
  try {
    transporter = createTransporter();
    
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Verify your ChatObay account",
      html: createVerificationEmailTemplate(name, code, clientURL),
      // Production için ek ayarlar
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.", info.messageId);
    console.log("Email sent to:", email);
    return info;
  } catch (error) {
    console.error("Error sending verification email: ", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      to: email,
      from: sender.email,
      host: process.env.SMTP_HOST
    });
    
    // Production'da daha detaylı hata mesajı
    const errorMessage = error.response 
      ? `SMTP Error: ${error.response}` 
      : error.message || "Unknown SMTP error";
    
    throw new Error(`Failed to send verification email: ${errorMessage}`);
  }
};