import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "alumni", "teacher", "admin"],
      default: "student",
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    passoutYear: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    degree: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    currentCompany: {
      type: String,
      trim: true,
      default: "",
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    mentorshipAvailable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ currentCompany: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ passoutYear: 1 });
userSchema.index({ skills: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.AccessTokenSecret || "connectify_access_secret";
  const expiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";

  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    secret,
    { expiresIn: expiry }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.RefreshTokenSecret || "connectify_refresh_secret";
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
    },
    secret,
    { expiresIn: expiry }
  );
};

userSchema.methods.generateEmailVerificationToken = function () {
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return unhashedToken;
};

userSchema.methods.generatePasswordResetToken = function () {
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  return unhashedToken;
};

export const User = mongoose.model("User", userSchema);
export default User;
