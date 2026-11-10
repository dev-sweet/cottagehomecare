const app = require("./app");
const { config } = require("./config/env");
const { connectDB, disconnectDB } = require("./config/db");

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(
      `Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`
    );
  });
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
