import express from "express";
import {
  completeOnboarding,
  login,
  logout,
  resendVerificationCode,
  signup,
  updateProfile,
  verifyEmail
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", protectRoute, verifyEmail);
router.post("/resend-code", protectRoute, resendVerificationCode);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/onboarding", protectRoute, completeOnboarding);

router.get("/check", protectRoute, (request, response) => response.status(200).json(request.user));

export default router;