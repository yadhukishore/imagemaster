class AppError extends Error {
  constructor(statusCode, message, data = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AppResponse {
  constructor(res, statusCode = 200, message = "Request success", data = {}) {
    res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }
}

export { AppError, AppResponse };
