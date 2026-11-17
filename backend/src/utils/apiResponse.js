class apiResponse {
  /**
   * Flexible API Response formatter
   * Handles:
   *  - new apiResponse(200, "User logged in", userData)
   *  - new apiResponse(200, userData, "User logged in")
   *  - new apiResponse(200, "Success")
   */
  constructor(statusCode, arg2 = "Success", arg3 = null) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 400;
    this.sucess = this.success; // backward compatibility for typo

    if (typeof arg2 === "string") {
      this.message = arg2;
      this.data = arg3;
    } else {
      this.data = arg2;
      this.message = typeof arg3 === "string" ? arg3 : "Success";
    }
  }
}

export default apiResponse;
export { apiResponse };
