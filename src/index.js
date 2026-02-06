require("dotenv/config");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const botConfig = require("./configs/botConfig.json");
const validateEnv = require("./utils/validateEnv");
const connectDB = require("./database");

(async () => {

  const asciiArt = `
  ____                   ____             
 / ___| _   _ _ __ __  _|  _ \\  _____   __
 \\___ \\| | | | '_ \\\\ \\/ / | | |\/ _ \\ \\ / /
  ___) | |_| | | | |>  <| |_| |  __/\\ V / 
 |____/ \\__, |_| |_/_/\\_\\____/ \\___| \\_/  
        |___/                              
`;

  console.log(asciiArt.blue);

  await validateEnv(botConfig);

  await connectDB();

  const client = new Client({
    intents: Object.keys(GatewayIntentBits).filter((key) => isNaN(key)),
    partials: Object.keys(Partials).filter((key) => isNaN(key)),
  });

  eventHandler(client);
  
  client.login(process.env.TOKEN);
})();