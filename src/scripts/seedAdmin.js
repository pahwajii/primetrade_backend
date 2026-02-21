const mongoose = require("mongoose");
const connectDB = require("../config/db");
const ensureAdminAccount = require("../config/bootstrapAdmin");

async function seed() {
  try {
    await connectDB();
    await ensureAdminAccount();
    console.log("Admin seed completed");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
