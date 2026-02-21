const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { createAccessToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: "user",
  });

  const token = createAccessToken(user);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = createAccessToken(user);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
    },
  });
});

const adminOnly = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

module.exports = {
  register,
  login,
  me,
  adminOnly,
};
