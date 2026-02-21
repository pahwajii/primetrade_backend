const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const apiRateLimit = require("./middlewares/rateLimit.middleware");
const { corsOrigin, nodeEnv } = require("./config/env");
const openApiSpec = require("./docs/openapi");
const { getAccessLogStream } = require("./config/logger");
const v1Routes = require("./routes/v1");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((origin) => origin.trim()),
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

if (nodeEnv !== "test") {
  app.use(morgan("dev"));
  app.use(morgan("combined", { stream: getAccessLogStream() }));
}

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
app.use("/api", apiRateLimit);
app.use("/api/v1", v1Routes);

app.use(express.static(path.join(__dirname, "../public")));
app.get("/sign-in", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sign-in.html"));
});
app.get("/create-account", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/create-account.html"));
});
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health" || req.path === "/api-docs") {
    return next();
  }
  return res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
