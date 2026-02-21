const dotenv = require("dotenv");

dotenv.config();

function parseNumber(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const required = ["MONGO_URI", "JWT_SECRET"];
required.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber("PORT", 4000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:4000",
  rateLimitWindowMs: parseNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  rateLimitMaxRequests: parseNumber("RATE_LIMIT_MAX_REQUESTS", 120),
  bootstrapAdminEmail: process.env.BOOTSTRAP_ADMIN_EMAIL || "",
  bootstrapAdminPassword: process.env.BOOTSTRAP_ADMIN_PASSWORD || "",
};
