const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cottage_homecare",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};

module.exports = { config };
