const User = require("../models/user.model");
const { verifyAccessToken } = require("../utils/generate-token");
const { sendError } = require("../utils/api-response");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Authentication token is required");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, "User belonging to this token no longer exists");
    }

    if (!user.isActive) {
      return sendError(res, 403, "User account is inactive");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Access token has expired");
    }
    return sendError(res, 401, "Invalid access token");
  }
};

// Optional auth extractor for logout when called with either access token or refresh token
const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = { id: decoded.id };
    } catch (_err) {
      // Allow logout to proceed via refreshToken in body/cookie even if accessToken expired
    }
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
