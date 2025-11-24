import { sendVerificationEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";
import { generateToken, generateVerificationCode, sanitizeUser } from "../lib/utils.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";

export const signup = async (request, response) => {
  const { fullName, email, password } = request.body;

  try {
    if (!fullName || !email || !password) {
      return response.status(400).json({ success: false, message: "All fields are required." });
    }
    if (password.length < 6) {
      return response.status(400).json({ success: false, message: "Password must be at least 6 characters.." });
    }

    // Check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({ success: false, message: "Invalid email format." });
    }

    // Check if user is exist
    const userIsExist = await User.findOne({ email });
    if (userIsExist) {
      return response.status(400).json({ success: false, message: "Email already exist." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rawVerificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(rawVerificationCode, 10);
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationCode: hashedVerificationCode,
      verificationCodeExpiresAt
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, response);

      response.status(201).json({ success: true, user: sanitizeUser(savedUser) });

      try {
        await sendVerificationEmail(savedUser.email, savedUser.fullName, rawVerificationCode, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send verification email", error);
      }
    } else {
      response.status(400).json({ success: false, message: "Invalid user data." });
    }

  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
}

export const login = async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) return response.status(400).json({ success: false, message: "All fields are required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return response.status(400).json({ success: false, message: "Invalid Credentials." });
    // Never tell the client which one is incorrect: email or password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return response.status(400).json({ success: false, message: "Invalid Credentials." });

    generateToken(user._id, response);

    return response.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
}

export const logout = async (request, response) => {
  response.cookie("jwt", "", { maxAge: 0 });
  response.status(200).json({ success: true, message: "Logged Out." });
}

export const updateProfile = async (request, response) => {
  try {
    const { profilePic, about } = request.body || {};
    const userId = request.user._id;

    const updates = {};

    if (typeof about === "string") {
      const trimmedAbout = about.trim();
      if (trimmedAbout.length > 500) {
        return response.status(400).json({ success: false, message: "About section must be 500 characters or less." });
      }
      updates.about = trimmedAbout;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResponse.secure_url;
    }

    if (Object.keys(updates).length === 0) {
      return response.status(400).json({ success: false, message: "Nothing to update." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    response.status(200).json({ success: true, message: "Profile updated.", updatedUser: sanitizeUser(updatedUser) });
  } catch (error) {
    console.log("Error in updateProfile controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
}

export const verifyEmail = async (request, response) => {
  const { code } = request.body;

  if (!code) {
    return response.status(400).json({ success: false, message: "Verification code is required." });
  }

  try {
    const user = await User.findById(request.user._id);

    if (!user) {
      return response.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return response.status(400).json({ success: false, message: "Email is already verified." });
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      return response.status(400).json({ success: false, message: "No verification code found. Request a new one." });
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      return response.status(400).json({ success: false, message: "Verification code has expired. Request a new one." });
    }

    const isCodeValid = await bcrypt.compare(code, user.verificationCode);
    if (!isCodeValid) {
      return response.status(400).json({ success: false, message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;

    const savedUser = await user.save();

    return response.status(200).json({ success: true, user: sanitizeUser(savedUser) });
  } catch (error) {
    console.log("Error in verifyEmail controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const resendVerificationCode = async (request, response) => {
  try {
    const user = await User.findById(request.user._id);

    if (!user) {
      return response.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return response.status(400).json({ success: false, message: "Email is already verified." });
    }

    const rawVerificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(rawVerificationCode, 10);
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = hashedVerificationCode;
    user.verificationCodeExpiresAt = verificationCodeExpiresAt;

    await user.save();

    await sendVerificationEmail(user.email, user.fullName, rawVerificationCode, ENV.CLIENT_URL);

    return response.status(200).json({ success: true, message: "Verification code resent." });
  } catch (error) {
    console.log("Error in resendVerificationCode controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const completeOnboarding = async (request, response) => {
  const { profilePic, about, phone } = request.body;
  if(!phone || phone.trim() === ""){
    return response.status(400).json({ success: false, message: "Phone number is required." });
  }

  try {
    const user = await User.findById(request.user._id);

    if (!user) {
      return response.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.isVerified) {
      return response.status(403).json({ success: false, message: "Email must be verified before completing onboarding." });
    }

    const updates = {
      onboardingCompleted: true,
    };

    if (typeof about === "string") {
      updates.about = about;
    }

    if (typeof phone === "string") {
      updates.phone = phone;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true }
    );

    return response.status(200).json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.log("Error in completeOnboarding controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const deleteAccount = async (request, response) => {
  try {
    const userId = request.user._id;

    // Delete all messages sent or received by this user
    await Message.deleteMany({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie
    response.cookie("jwt", "", { maxAge: 0 });

    return response.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.log("Error in deleteAccount controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
};