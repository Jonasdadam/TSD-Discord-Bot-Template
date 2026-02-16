require("colors");

/**
 * Validates environment variables and botConfig.
 * REMOVED: Readline interaction. This breaks non-interactive hosting environments (Docker/Pterodactyl).
 */
module.exports = async (botConfig) => {
	// Check critical fields in botConfig.json
	if (!botConfig.development?.devIDs || !Array.isArray(botConfig.development.devIDs) || botConfig.development.devIDs.length === 0) {
		console.error("\n[CRITICAL] ‘development.devIDs’ is missing or empty in src/configs/botConfig.json.".red);
        console.error("[ACTION] Please add your Discord User ID to the 'devIDs' array in botConfig.json.".yellow);
		process.exit(1);
	}

	if (!botConfig.development?.devServerID) {
        console.error("\n[CRITICAL] ‘development.devServerID’ is missing from src/configs/botConfig.json.".red);
        console.error("[ACTION] Please add your Development Server ID to 'devServerID' in botConfig.json.".yellow);
		process.exit(1);
	}

	// Critical environmental variables (TOKEN & MONGO)
	const requiredEnv = ["TOKEN", "MONGODB_TOKEN"];
    const missingEnv = requiredEnv.filter((env) => !process.env[env]);

    if (missingEnv.length > 0) {
        console.error(`\n[CRITICAL] Missing environment variables: ${missingEnv.join(", ")}`.red);
        console.error("[ACTION] Please create a .env file and add the missing variables.".yellow);
        process.exit(1);
    }

	// Optional webhooks warning (Non-blocking)
	const optionalWebhooks = [
		{ key: "commandLogWebhookURL", label: "Command Logs" },
		{ key: "buttonLogWebhookURL", label: "Button Logs" },
		{ key: "contextLogWebhookURL", label: "Context Menu Logs" },
	];

	for (const webhook of optionalWebhooks) {
		if (!process.env[webhook.key]) {
			console.warn(`[WARNING] Webhook for ${webhook.label} (${webhook.key}) is missing in .env. Logging for this module will be disabled.`.grey);
		}
	}

	console.log("\n[VALIDATION] All checks completed. Bot starting up...\n".green);
};