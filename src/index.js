require("dotenv/config");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
  intents: Object.keys(GatewayIntentBits).filter((key) => isNaN(key)),
  partials: Object.keys(Partials).filter((key) => isNaN(key)),
});

eventHandler(client);

client.login(process.env.TOKEN);
