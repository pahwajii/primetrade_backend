const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function canAccessTask(user, task) {
  if (user.role === "admin") {
    return true;
  }

  const ownerId =
    task.owner && typeof task.owner === "object" && task.owner._id
      ? task.owner._id.toString()
      : task.owner
        ? task.owner.toString()
        : "";

  return ownerId === user.id;
}

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    dueDate: dueDate || null,
    owner: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: {
      task,
    },
  });
});

const listTasks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const filters = {};
  if (req.query.status) {
    filters.status = req.query.status;
  }

  if (req.user.role === "user") {
    filters.owner = req.user.id;
  } else if (req.query.ownerId) {
    filters.owner = req.query.ownerId;
  }

  const [items, total] = await Promise.all([
    Task.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email role"),
    Task.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate("owner", "name email role");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(req.user, task)) {
    throw new ApiError(403, "You are not allowed to access this task");
  }

  res.status(200).json({
    success: true,
    data: {
      task,
    },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(req.user, task)) {
    throw new ApiError(403, "You are not allowed to update this task");
  }

  const updates = {};
  ["title", "description", "status", "dueDate"].forEach((field) => {
    if (field in req.body) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "At least one updatable field is required");
  }

  Object.assign(task, updates);
  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: {
      task,
    },
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canAccessTask(req.user, task)) {
    throw new ApiError(403, "You are not allowed to delete this task");
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
