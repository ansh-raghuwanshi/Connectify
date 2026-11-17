import { User } from "../model/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendMail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Core registration handler supporting all roles
 */
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = "student",
    enrollmentNumber,
    passoutYear,
    department,
    branch,
    degree,
    currentCompany,
    jobTitle,
    skills,
    location,
  } = req.body;

  // Basic required validations
  if (!name || !name.trim()) {
    throw new apiError(400, "Name is required");
  }
  if (!email || !email.trim()) {
    throw new apiError(400, "Email is required");
  }
  if (!password) {
    throw new apiError(400, "Password is required");
  }
  if (password.length < 6) {
    throw new apiError(400, "Password must be at least 6 characters long");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new apiError(400, "Invalid email format");
  }

  const validRoles = ["student", "alumni", "teacher", "admin"];
  const userRole = role.toLowerCase().trim();
  if (!validRoles.includes(userRole)) {
    throw new apiError(400, `Invalid role. Allowed roles: ${validRoles.join(", ")}`);
  }

  // Student and alumni require enrollment number and passout year
  if (userRole === "student" || userRole === "alumni") {
    if (!enrollmentNumber || !enrollmentNumber.trim()) {
      throw new apiError(400, "Enrollment number is required for students and alumni");
    }
    if (!passoutYear || !passoutYear.toString().trim()) {
      throw new apiError(400, "Passout year is required for students and alumni");
    }
  }

  const normalizedEmail = email.toLowerCase().trim();
  const searchCriteria = [{ email: normalizedEmail }];
  if (enrollmentNumber && enrollmentNumber.trim()) {
    searchCriteria.push({ enrollmentNumber: enrollmentNumber.trim() });
  }

  const existingUser = await User.findOne({ $or: searchCriteria });

  let user;
  let unhashedToken;

  if (existingUser) {
    // If the existing user is ALREADY verified, reject registration as conflict
    if (existingUser.isEmailVerified) {
      throw new apiError(
        409,
        "An account with this email or enrollment number already exists and is verified. Please log in."
      );
    }

    // SAFE RECOVERY: If an UNVERIFIED account exists, update credentials and resend verification
    existingUser.name = name.trim();
    existingUser.password = password; // Will be hashed by pre-save hook
    existingUser.role = userRole;
    if (enrollmentNumber) existingUser.enrollmentNumber = enrollmentNumber.trim();
    if (passoutYear) existingUser.passoutYear = passoutYear.toString().trim();
    if (department) existingUser.department = department.trim();
    if (branch) existingUser.branch = branch.trim();
    if (degree) existingUser.degree = degree.trim();
    if (currentCompany) existingUser.currentCompany = currentCompany.trim();
    if (jobTitle) existingUser.jobTitle = jobTitle.trim();
    if (skills && Array.isArray(skills)) existingUser.skills = skills;
    if (location) existingUser.location = location.trim();

    unhashedToken = existingUser.generateEmailVerificationToken();
    user = await existingUser.save();
  } else {
    // Create fresh user
    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: userRole,
      enrollmentNumber: enrollmentNumber ? enrollmentNumber.trim() : undefined,
      passoutYear: passoutYear ? passoutYear.toString().trim() : undefined,
      department: department ? department.trim() : undefined,
      branch: branch ? branch.trim() : undefined,
      degree: degree ? degree.trim() : undefined,
      currentCompany: currentCompany ? currentCompany.trim() : undefined,
      jobTitle: jobTitle ? jobTitle.trim() : undefined,
      skills: Array.isArray(skills) ? skills : [],
      location: location ? location.trim() : undefined,
      isEmailVerified: false,
    });

    unhashedToken = user.generateEmailVerificationToken();
    await user.save();
  }

  // Generate verification URL
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email?token=${unhashedToken}`;
  const emailTemplate = verificationEmailTemplate({
    name: user.name,
    verificationUrl,
  });

  console.log("\n========================================================");
  console.log(`[Email Service] Verification Link for ${user.email}:`);
  console.log(`🔗 ${verificationUrl}`);
  console.log("========================================================\n");

  // Attempt to send verification email
  let emailSent = false;
  let emailError = null;
  try {
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    emailSent = true;
  } catch (err) {
    emailError = err.message || "Failed to send email";
    console.error(`[Registration] Email dispatch failed for ${user.email}:`, emailError);
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );

  if (emailSent) {
    return res.status(201).json(
      new apiResponse(
        201,
        "User registered successfully. Please check your email (including Spam/Junk folder) to verify your account.",
        {
          user: createdUser,
          emailSent: true,
          verificationUrl: process.env.NODE_ENV !== "production" ? verificationUrl : undefined,
        }
      )
    );
  } else {
    // Precise state communication: account created, email sending pending/failed
    return res.status(201).json(
      new apiResponse(
        201,
        "Account created, but verification email could not be delivered at this moment. You can click 'Resend Verification' or contact support.",
        {
          user: createdUser,
          emailSent: false,
          warning: "Email delivery failed: check Brevo credentials and sender verification.",
        }
      )
    );
  }
});

// Role-specific wrappers preserving existing endpoints
const registerStudent = asyncHandler(async (req, res) => {
  req.body.role = "student";
  return registerUser(req, res);
});

const registerAlumni = asyncHandler(async (req, res) => {
  req.body.role = "alumni";
  return registerUser(req, res);
});

const registerTeacher = asyncHandler(async (req, res) => {
  req.body.role = "teacher";
  return registerUser(req, res);
});

/**
 * Verify account using verification token
 * Accepts token via URL params, query string, or body
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params?.token || req.query?.token || req.body?.token;

  if (!token) {
    throw new apiError(400, "Verification token is required");
  }

  // Hash incoming token using SHA-256 to compare with stored token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Query by hashed token or plain token (for backward compatibility)
  const user = await User.findOne({
    $or: [
      {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      },
      {
        emailVerificationToken: token, // legacy unhashed support
      },
    ],
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new apiError(400, "Invalid or expired email verification link");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return res.status(200).json(
    new apiResponse(
      200,
      "Email verified successfully. Your account is now active and you can log in.",
      { isEmailVerified: true }
    )
  );
});

/**
 * Resend verification email
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    throw new apiError(400, "Email address is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  // Prevent email enumeration: return consistent response whether user exists or not
  if (!user || user.isEmailVerified) {
    return res.status(200).json(
      new apiResponse(
        200,
        "If an unverified account exists with this email address, a verification link has been sent."
      )
    );
  }

  const unhashedToken = user.generateEmailVerificationToken();
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email?token=${unhashedToken}`;
  const template = verificationEmailTemplate({
    name: user.name,
    verificationUrl,
  });

  console.log("\n========================================================");
  console.log(`[Resend Verification] Link for ${user.email}:`);
  console.log(`🔗 ${verificationUrl}`);
  console.log("========================================================\n");

  let emailSent = false;
  try {
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    emailSent = true;
  } catch (error) {
    console.error(`[Resend Verification] Email failed for ${user.email}:`, error.message);
  }

  return res.status(200).json(
    new apiResponse(
      200,
      "If an unverified account exists with this email address, a verification link has been sent (check Spam/Junk if not in inbox).",
      {
        emailSent,
        verificationUrl: process.env.NODE_ENV !== "production" ? verificationUrl : undefined,
      }
    )
  );
});

/**
 * User login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new apiError(400, "Invalid email or password");
  }

  const isPasswordMatch = await user.isPasswordCorrect(password);
  if (!isPasswordMatch) {
    throw new apiError(400, "Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new apiError(
      403,
      "Email not verified. Please verify your email before logging in. You can request a new verification link if needed."
    );
  }

  if (!user.isActive) {
    throw new apiError(403, "Your account has been deactivated. Please contact support.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(200, "Login successful", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

/**
 * User profile retrieval (current user)
 */
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );

  if (!user) {
    throw new apiError(404, "User not found");
  }

  return res.status(200).json(new apiResponse(200, "User details retrieved successfully", user));
});

/**
 * Profile update
 */
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    profilePicture,
    bio,
    department,
    branch,
    degree,
    passoutYear,
    currentCompany,
    jobTitle,
    skills,
    location,
    linkedinUrl,
    githubUrl,
    mentorshipAvailable,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (name && name.trim()) user.name = name.trim();
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (bio !== undefined) user.bio = bio;
  if (department !== undefined) user.department = department;
  if (branch !== undefined) user.branch = branch;
  if (degree !== undefined) user.degree = degree;
  if (passoutYear !== undefined) user.passoutYear = passoutYear;
  if (currentCompany !== undefined) user.currentCompany = currentCompany;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (skills && Array.isArray(skills)) user.skills = skills;
  if (location !== undefined) user.location = location;
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (mentorshipAvailable !== undefined) user.mentorshipAvailable = Boolean(mentorshipAvailable);

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );

  return res.status(200).json(new apiResponse(200, "Profile updated successfully", updatedUser));
});

/**
 * User logout
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new apiResponse(200, "Logout successful", null));
});

/**
 * Refresh access token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.headers?.authorization?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new apiError(401, "Refresh token not provided");
  }

  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.RefreshTokenSecret || "connectify_refresh_secret";

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, secret);
  } catch (error) {
    throw new apiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new apiError(401, "Refresh token is invalid or has been revoked");
  }

  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new apiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken: newRefreshToken,
      })
    );
});

/**
 * Forgot password handler
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    throw new apiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(200).json(
      new apiResponse(200, "If an account with this email exists, a password reset link has been sent.")
    );
  }

  const unhashedResetToken = user.generatePasswordResetToken();
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${unhashedResetToken}`;
  const template = passwordResetEmailTemplate({
    name: user.name,
    resetUrl,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err) {
    console.error("[Forgot Password] Email send failure:", err.message);
  }

  return res.status(200).json(
    new apiResponse(200, "If an account with this email exists, a password reset link has been sent.")
  );
});

/**
 * Reset password handler
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    throw new apiError(400, "Reset token is required");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new apiError(400, "New password must be at least 6 characters long");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new apiError(400, "Password reset token is invalid or has expired");
  }

  user.password = newPassword; // hashed in pre-save hook
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null; // Invalidate existing sessions
  await user.save();

  return res.status(200).json(new apiResponse(200, "Password has been reset successfully. Please log in with your new password."));
});

export {
  registerUser,
  registerStudent,
  registerAlumni,
  registerTeacher,
  registerTeacher as regiseterTeacher, // typo compatibility
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  me,
  updateProfile,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};
