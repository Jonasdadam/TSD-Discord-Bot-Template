const readline = require("readline");
require("colors");

/**
 * Valideert omgevingsvariabelen en botConfig. Vraagt om input via de console indien nodig.
 */
module.exports = async (botConfig) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  // 1. Controleer/Vraag kritieke velden in botConfig.json
  if (!botConfig.development?.devIDs || !Array.isArray(botConfig.development.devIDs) || botConfig.development.devIDs.length === 0) {
    console.warn("\n[WAARSCHUWING] 'development.devIDs' ontbreekt of is leeg in botConfig.json.".yellow);
    const answer = await question("Voer een Developer ID in (of laat leeg om te stoppen): ");
    
    if (answer && answer.trim().length > 0) {
      if (!botConfig.development) botConfig.development = {};
      botConfig.development.devIDs = [answer.trim()];
      console.log("[OK] Developer ID tijdelijk ingesteld.".green);
    } else {
      console.error("[CRITICAL] Geen Developer ID opgegeven. Bot stopt.".red);
      process.exit(1);
    }
  }

  if (!botConfig.development?.devServerID) {
    console.warn("\n[WAARSCHUWING] 'development.devServerID' ontbreekt in botConfig.json.".yellow);
    const answer = await question("Voer het ID van de Developer Server in (of laat leeg om te stoppen): ");
    
    if (answer && answer.trim().length > 0) {
      botConfig.development.devServerID = answer.trim();
      console.log("[OK] Developer Server ID tijdelijk ingesteld.".green);
    } else {
      console.error("[CRITICAL] Geen Server ID opgegeven. Bot stopt.".red);
      process.exit(1);
    }
  }

  // 2. Kritieke omgevingsvariabelen (TOKEN & MONGO)
  const requiredEnv = ["TOKEN", "MONGODB_TOKEN"];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`\n[CRITICAL] Omgevingsvariabele ${env} ontbreekt. De bot kan niet starten.`.red);
      process.exit(1);
    }
  }

  // 3. Optionele webhooks
  const optionalWebhooks = [
    { key: "commandLogWebhookURL", label: "Command Logs" },
    { key: "buttonLogWebhookURL", label: "Button Logs" },
    { key: "contextLogWebhookURL", label: "Context Menu Logs" },
  ];

  for (const webhook of optionalWebhooks) {
    if (!process.env[webhook.key]) {
      console.warn(`\n[WAARSCHUWING] Webhook voor ${webhook.label} (${webhook.key}) ontbreekt.`.yellow);
      const answer = await question(`Wil je een URL invullen voor ${webhook.label}? (Type URL of druk op Enter om te negeren): `);
      
      if (answer && answer.trim().startsWith("http")) {
        process.env[webhook.key] = answer.trim();
        console.log(`[OK] ${webhook.label} URL ingesteld.`.green);
      } else {
        console.log(`[SKIP] ${webhook.label} logging uitgeschakeld.`.grey);
      }
    }
  }

  rl.close();
  console.log("\n[VALIDATION] Alle controles voltooid. Bot start op...\n".green);
};