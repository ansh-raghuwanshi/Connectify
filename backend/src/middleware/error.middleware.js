import apiError from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof apiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new apiError(statusCode, message, error?.errors || [], err.stack);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `An account with this ${field} already exists.`;
    error = new apiError(409, message, [message]);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new apiError(400, messages.join(", "), messages);
  }

  if (err.name === "JsonWebTokenError") {
    error = new apiError(401, "Invalid authentication token.");
  }

  if (err.name === "TokenExpiredError") {
    error = new apiError(401, "Authentication token has expired.");
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
export { errorHandler };
