const { param, query } = require("express-validator");

const listUsersValidation = [
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
];

const userIdParamValidation = [
  param("userId").isMongoId().withMessage("userId must be a valid id"),
];

module.exports = {
  listUsersValidation,
  userIdParamValidation,
};
