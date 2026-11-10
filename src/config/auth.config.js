const dotenv = require("dotenv");

dotenv.config();

const authConfig = {
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || "default_access_secret_key",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  saltRounds: 10,
};

module.exports = authConfig;
