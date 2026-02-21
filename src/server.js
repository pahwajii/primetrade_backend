const app = require("./app");
const connectDB = require("./config/db");
const ensureAdminAccount = require("./config/bootstrapAdmin");
const { port } = require("./config/env");

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
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer();
