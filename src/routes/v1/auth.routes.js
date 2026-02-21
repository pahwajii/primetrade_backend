const express = require("express");
const validateRequest = require("../../middlewares/validate.middleware");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../../validators/auth.validators");
const { register, login, me, adminOnly } = require("../../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", authenticate, me);
router.get("/admin", authenticate, authorizeRoles("admin"), adminOnly);

module.exports = router;
