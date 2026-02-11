const logError = require("../utils/errorLogger");
require("colors");

module.exports = (client) => {
  // 1. Unhandled Rejection
  process.on("unhandledRejection", (reason, p) => {
    console.log("[ANTI-CRASH] Unhandled Rejection".red);
    logError(client, reason, "Unhandled Rejection");
  });

  // 2. Uncaught Exception
  process.on("uncaughtException", (err, origin) => {
    console.log("[ANTI-CRASH] Uncaught Exception".red);
    logError(client, err, "Uncaught Exception");
  });

  // 3. Monitor (Let's leave it blank to avoid duplicate logs)
  process.on("uncaughtExceptionMonitor", (err, origin) => {});
};