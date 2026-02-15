const logError = require("../utils/errorLogger");
require("colors");

module.exports = (client) => {
	// Unhandled Rejection
	process.on("unhandledRejection", (reason, p) => {
		console.log("[ANTI-CRASH] Unhandled Rejection".red);
		logError(client, reason, "Unhandled Rejection");
	});

	// Uncaught Exception
	process.on("uncaughtException", (err, origin) => {
		console.log("[ANTI-CRASH] Uncaught Exception".red);
		logError(client, err, "Uncaught Exception");
	});

	// Monitor (Let's leave it blank to avoid duplicate logs)
	process.on("uncaughtExceptionMonitor", (err, origin) => {});
};
