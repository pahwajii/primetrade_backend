const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: users.map((user) => user.toSafeObject()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const listTasksByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const [tasks, total] = await Promise.all([
    Task.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email role"),
    Task.countDocuments({ owner: userId }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      items: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = {
  listUsers,
  listTasksByUser,
};
