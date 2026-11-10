const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    authConfig.jwtAccessSecret,
    { expiresIn: authConfig.jwtAccessExpiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      jti: crypto.randomUUID(),
    },
    authConfig.jwtRefreshSecret,
    { expiresIn: authConfig.jwtRefreshExpiresIn }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, authConfig.jwtAccessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, authConfig.jwtRefreshSecret);
};

// Pre-hash with SHA-256 before bcrypt so JWTs (>72 bytes) are never truncated
const digestToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const hashRefreshToken = async (token) => {
  return bcrypt.hash(digestToken(token), authConfig.saltRounds);
};

const compareRefreshToken = async (token, tokenHash) => {
  if (!token || !tokenHash) return false;
  return bcrypt.compare(digestToken(token), tokenHash);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
};

