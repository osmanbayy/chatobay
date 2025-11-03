import { generateToken } from "../lib/utils.js";
import User from "../models/User.js"
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

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, response);

      response.status(201).json({ success: true, newUser });

      // todo: send a welcome email to new user
    } else {
      response.status(400).json({ success: false, message: "Invalid user data." });
    }

  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    response.status(500).json({ success: false, message: "Internal Server Error." });
  }
}