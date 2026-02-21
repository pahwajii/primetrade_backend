const { body, param, query } = require("express-validator");

const allowedStatuses = ["todo", "in_progress", "done"];

const taskIdParamValidation = [
  param("taskId").isMongoId().withMessage("taskId must be a valid id"),
];

const createTaskValidation = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 150 })
    .withMessage("Title must be at most 150 characters"),
  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("status")
    .optional()
    .isIn(allowedStatuses)
    .withMessage("Status must be todo, in_progress, or done"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO date")
    .toDate(),
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 150 })
    .withMessage("Title must be at most 150 characters"),
  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("status")
    .optional()
    .isIn(allowedStatuses)
    .withMessage("Status must be todo, in_progress, or done"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO date")
    .toDate(),
];

const listTaskValidation = [
  query("status")
    .optional()
    .isIn(allowedStatuses)
    .withMessage("status must be todo, in_progress, or done"),
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("ownerId")
    .optional()
    .isMongoId()
    .withMessage("ownerId must be a valid id"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "dueDate", "status", "title"])
    .withMessage("sortBy must be one of createdAt, dueDate, status, title"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be asc or desc"),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdParamValidation,
  listTaskValidation,
};
