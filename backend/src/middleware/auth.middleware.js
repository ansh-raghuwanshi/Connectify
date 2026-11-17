import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";

/**
 * Authentication Middleware: Validates JWT Access Token
 */
const verifyJwt = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new apiError(401, "Authentication required. Please log in."));
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.AccessTokenSecret || "connectify_access_secret";

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new apiError(401, "Access token has expired. Please refresh your session."));
      }
      return next(new apiError(401, "Invalid access token."));
    }

    const user = await User.findById(decoded.userId).select("-password -refreshToken -emailVerificationToken");
    if (!user) {
      return next(new apiError(401, "User belonging to this token no longer exists."));
    }

    if (!user.isActive) {
      return next(new apiError(403, "Your account has been deactivated. Please contact support."));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new apiError(500, error.message || "Internal authentication error."));
  }
};

export default verifyJwt;
export { verifyJwt };
