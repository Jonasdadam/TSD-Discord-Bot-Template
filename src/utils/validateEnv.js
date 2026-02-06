const readline = require("readline");
require("colors");

/**
 * Validates environment variables and botConfig. Prompts for input via the console if necessary.
 */
module.exports = async (botConfig) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  // Check/Ask critical fields in botConfig.json
  if (!botConfig.development?.devIDs || !Array.isArray(botConfig.development.devIDs) || botConfig.development.devIDs.length === 0) {
    console.warn("\n[WARNING] ‘development.devIDs’ is missing or empty in botConfig.json.".yellow);
    const answer = await question("Enter a Developer ID (or leave blank to quit): ");
    
    if (answer && answer.trim().length > 0) {
      if (!botConfig.development) botConfig.development = {};
      botConfig.development.devIDs = [answer.trim()];
      console.log("[OK] Developer ID temporarily set.".green);
    } else {
      console.error("[CRITICAL] No Developer ID specified. The bot will not start.".red);
      process.exit(1);
    }
  }

  if (!botConfig.development?.devServerID) {
    console.warn("\n[WARNING] ‘development.devServerID’ is missing from botConfig.json.".yellow);
    const answer = await question("Enter the Developer Server ID (or leave blank to stop): ");
    
    if (answer && answer.trim().length > 0) {
      botConfig.development.devServerID = answer.trim();
      console.log("[OK] Developer Server ID temporarily set.".green);
    } else {
      console.error("[CRITICAL] No Developer Server ID specified. The bot will not start.".red);
      process.exit(1);
    }
  }

  // Critical environmental variables (TOKEN & MONGO)
  const requiredEnv = ["TOKEN", "MONGODB_TOKEN"];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`\n[CRITICAL] Environment variable ${env} is missing. The bot cannot start.`.red);
      process.exit(1);
    }
  }

  // Optional webhooks
  const optionalWebhooks = [
    { key: "commandLogWebhookURL", label: "Command Logs" },
    { key: "buttonLogWebhookURL", label: "Button Logs" },
    { key: "contextLogWebhookURL", label: "Context Menu Logs" },
  ];

  for (const webhook of optionalWebhooks) {
    if (!process.env[webhook.key]) {
      console.warn(`\n[WARNING] Webhook for ${webhook.label} (${webhook.key}) is missing.`.yellow);
      const answer = await question(`Would you like to enter a URL for ${webhook.label}? (Type URL or press Enter to ignore): `);
      
      if (answer && answer.trim().startsWith("http")) {
        process.env[webhook.key] = answer.trim();
        console.log(`[OK] ${webhook.label} URL temporarily set.`.green);
      } else {
        console.log(`[SKIP] ${webhook.label} logging disabled.`.grey);
      }
    }
  }

  rl.close();
  console.log("\n[VALIDATION] All checks completed. Bot starting up...\n".green);
};