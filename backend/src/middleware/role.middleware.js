import apiError from "../utils/apiError.js";

/**
 * Role-Based Access Control (RBAC) Middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new apiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new apiError(
          403,
          `Access denied. Required role: ${roles.join(" or ")}. Your role is: ${req.user.role}`
        )
      );
    }
    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new apiError(403, "Access denied. Administrator privileges required."));
  }
  next();
};

const requireAlumni = (req, res, next) => {
  if (!req.user || req.user.role !== "alumni") {
    return next(new apiError(403, "Access denied. Alumni privileges required."));
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return next(new apiError(403, "Access denied. Faculty/Teacher privileges required."));
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return next(new apiError(403, "Access denied. Student privileges required."));
  }
  next();
};

export {
  requireRole,
  requireAdmin,
  requireAlumni,
  requireAlumni as requireAlumini, // backward-compatibility alias
  requireTeacher,
  requireStudent,
};
