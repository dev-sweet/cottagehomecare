const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/api-response");
const { config } = require("../config/env");

const REFRESH_COOKIE_NAME = "refreshToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());
    return sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());
    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, 200, "Current user retrieved successfully", {
      user,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token =
      req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await authService.rotateRefreshToken(token);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());
    return sendSuccess(res, 200, "Token refreshed successfully", result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token =
      req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logoutUser({
      userId: req.user?.id,
      refreshToken: token,
    });
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
    });
    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
