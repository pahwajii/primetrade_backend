const app = require("./app");
const connectDB = require("./config/db");
const ensureAdminAccount = require("./config/bootstrapAdmin");
const { port } = require("./config/env");
const { writeErrorLog } = require("./config/logger");

async function startServer() {
  try {
    await connectDB();
    await ensureAdminAccount();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  const message = `Unhandled rejection: ${
    reason && reason.stack ? reason.stack : String(reason)
  }`;
  console.error(message);
  writeErrorLog(message);
});

process.on("uncaughtException", (error) => {
  const message = `Uncaught exception: ${error && error.stack ? error.stack : String(error)}`;
  console.error(message);
  writeErrorLog(message);
  process.exit(1);
});

startServer();
