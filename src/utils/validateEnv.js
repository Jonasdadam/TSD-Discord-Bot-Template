const readline = require("readline");

/**
 * Valideert omgevingsvariabelen en vraagt om input voor ontbrekende optionele webhooks.
 * Controleert tevens of de botConfig de juiste velden bevat.
 */
module.exports = async (botConfig) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  // 1. Controleer kritieke velden in botConfig.json
  if (!botConfig.development?.devIDs || !Array.isArray(botConfig.development.devIDs)) {
    console.error("[CRITICAL] 'development.devIDs' ontbreekt of is geen array in botConfig.json.".red);
    process.exit(1);
  }

  if (!botConfig.development?.devServerID) {
    console.error("[CRITICAL] 'development.devServerID' ontbreekt in botConfig.json.".red);
    process.exit(1);
  }

  // 2. Kritieke omgevingsvariabelen (bot stopt als deze missen)
  const requiredEnv = ["TOKEN", "MONGODB_TOKEN"];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`[CRITICAL] Omgevingsvariabele ${env} ontbreekt. De bot kan niet starten.`.red);
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
      console.warn(`[WAARSCHUWING] Webhook voor ${webhook.label} (${webhook.key}) ontbreekt.`.yellow);
      const answer = await question(`Wil je een URL invullen voor ${webhook.label}? (Type URL of druk op Enter om te negeren): `);
      
      if (answer && answer.trim().startsWith("http")) {
        process.env[webhook.key] = answer.trim();
        console.log(`[OK] ${webhook.label} URL ingesteld voor deze sessie.`.green);
      } else {
        console.log(`[SKIP] ${webhook.label} logging wordt uitgeschakeld.`.grey);
      }
    }
  }

  rl.close();
  console.log("[VALIDATION] Validatie van config en env voltooid. Bot start op...".green);
};