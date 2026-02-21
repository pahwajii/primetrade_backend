const rateLimit = require("express-rate-limit");
const { rateLimitWindowMs, rateLimitMaxRequests } = require("../config/env");

const apiRateLimit = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = apiRateLimit;
