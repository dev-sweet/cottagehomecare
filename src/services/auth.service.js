const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
} = require("../utils/generate-token");
const { createHttpError } = require("../utils/api-response");

const issueTokensAndSaveSession = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = await hashRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createHttpError("Email is already registered", 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const { accessToken, refreshToken } = await issueTokensAndSaveSession(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +refreshTokenHash"
  );

  if (!user) {
    throw createHttpError("Invalid credentials", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createHttpError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw createHttpError("Account is inactive. Please contact support.", 403);
  }

  const { accessToken, refreshToken } = await issueTokensAndSaveSession(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError("User not found", 404);
  }

  if (!user.isActive) {
    throw createHttpError("Account is inactive", 403);
  }

  return user.toJSON();
};

const rotateRefreshToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw createHttpError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (_error) {
    throw createHttpError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw createHttpError("Refresh token has been revoked or is invalid", 401);
  }

  if (!user.isActive) {
    throw createHttpError("Account is inactive", 403);
  }

  const isTokenMatching = await compareRefreshToken(
    incomingRefreshToken,
    user.refreshTokenHash
  );

  if (!isTokenMatching) {
    // Possible token reuse detected: revoke current refresh token hash
    user.refreshTokenHash = null;
    await user.save({ validateBeforeSave: false });
    throw createHttpError("Refresh token has been revoked or is invalid", 401);
  }

  // Rotate refresh token and issue new access token
  const { accessToken, refreshToken } = await issueTokensAndSaveSession(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const logoutUser = async ({ userId, refreshToken }) => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
    return;
  }

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
    } catch (_error) {
      // Ignore invalid token during logout
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  rotateRefreshToken,
  logoutUser,
};
