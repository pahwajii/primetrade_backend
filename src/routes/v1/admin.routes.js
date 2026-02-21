const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const validateRequest = require("../../middlewares/validate.middleware");
const { listUsers, listTasksByUser } = require("../../controllers/admin.controller");
const {
  listUsersValidation,
  userIdParamValidation,
} = require("../../validators/admin.validators");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/users", listUsersValidation, validateRequest, listUsers);
router.get(
  "/users/:userId/tasks",
  [...userIdParamValidation, ...listUsersValidation],
  validateRequest,
  listTasksByUser
);

module.exports = router;
