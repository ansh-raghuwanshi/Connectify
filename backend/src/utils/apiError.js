class apiError extends Error {
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.sucess = false; // backward compatibility
    this.message = message;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.error = this.errors; // backward compatibility
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default apiError;
export { apiError };
