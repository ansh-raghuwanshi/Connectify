class apiResponse {
  constructor(statusCode, message="sucess",data) {
    this.statusCode=statusCode;
    this.sucess=statusCode>=200 && statusCode<400;
    this.message=message;
    this.data=data;
  }
}

export default apiResponse;