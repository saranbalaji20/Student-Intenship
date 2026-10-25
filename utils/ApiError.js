/**
 * Error type used by route handlers to return a specific HTTP status code.
 */
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
