const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { bootstrapAdminEmail, bootstrapAdminPassword } = require("./env");

async function ensureAdminAccount() {
  if (!bootstrapAdminEmail || !bootstrapAdminPassword) {
    return;
  }

  const normalizedEmail = bootstrapAdminEmail.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log("Existing user elevated to admin role");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(bootstrapAdminPassword, 12);

  await User.create({
    name: "PrimeTrade Admin",
    email: normalizedEmail,
    passwordHash,
    role: "admin",
  });

  console.log("Bootstrap admin user created");
}

module.exports = ensureAdminAccount;
