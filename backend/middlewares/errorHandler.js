class httpError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default httpError;
