class apiError extends Error{
  constructor(statusCode , message,error=[]){
    super(message);
    this.statusCode = statusCode;
    this.sucess = false;
    this.error = error;
    error.captureStackTrace(this,this.constructor);
  }
}

export default apiError;