const ApiError = require("../utils/ApiError");
const { nodeEnv } = require("../config/env");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    message,
  };

  if (err.details) {
    response.errors = err.details;
  }

  if (nodeEnv !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFound,
  errorHandler,
};
