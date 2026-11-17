import { Router } from "express";
import {
  registerUser,
  registerStudent,
  registerAlumni,
  registerTeacher,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  refreshAccessToken,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

// Registration routes
router.route("/register").post(registerUser);
router.route("/registerStudent").post(registerStudent);
router.route("/registerAlumni").post(registerAlumni);
router.route("/registerTeacher").post(registerTeacher);

// Email verification routes
router.route("/verify-email/:token").get(verifyEmail);
router.route("/verify-email").get(verifyEmail).post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);

// Authentication & recovery routes
router.route("/login").post(loginUser);
router.route("/refresh-token").get(refreshAccessToken).post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Protected routes
router.route("/logout").post(verifyJwt, logout);
router.route("/me").get(verifyJwt, me).put(verifyJwt, updateProfile);
router.route("/profile").get(verifyJwt, me).put(verifyJwt, updateProfile);

export default router;
