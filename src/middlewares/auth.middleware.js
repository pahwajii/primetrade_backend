const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const token = authorization.replace("Bearer ", "").trim();
  if (!token) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = authenticate;
