const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const validateRequest = require("../../middlewares/validate.middleware");
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdParamValidation,
  listTaskValidation,
} = require("../../validators/task.validators");
const {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../../controllers/task.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", createTaskValidation, validateRequest, createTask);
router.get("/", listTaskValidation, validateRequest, listTasks);
router.get("/:taskId", taskIdParamValidation, validateRequest, getTaskById);
router.patch(
  "/:taskId",
  [...taskIdParamValidation, ...updateTaskValidation],
  validateRequest,
  updateTask
);
router.delete("/:taskId", taskIdParamValidation, validateRequest, deleteTask);

module.exports = router;
