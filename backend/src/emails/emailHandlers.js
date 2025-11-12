import { createTransporter, sender } from "../lib/nodemailer.js";
import { createVerificationEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to ChatObay",
      html: createWelcomeEmailTemplate(name, clientURL)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome Email Sent Successfully.", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email: ", error);
    throw new Error("Failed to send welcome email.");
  }
};

export const sendVerificationEmail = async (email, name, code, clientURL) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Verify your ChatObay account",
      html: createVerificationEmailTemplate(name, code, clientURL)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.", info.messageId);
  } catch (error) {
    console.error("Error sending verification email: ", error);
    throw new Error("Failed to send verification email.");
  }
};