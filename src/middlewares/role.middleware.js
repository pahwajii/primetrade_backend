const ApiError = require("../utils/ApiError");

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You are not allowed to access this resource"));
    }

    return next();
  };
}

module.exports = authorizeRoles;
