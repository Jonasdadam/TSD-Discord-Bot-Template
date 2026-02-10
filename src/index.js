require("dotenv/config");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const botConfig = require("./configs/botConfig.json");
const startupValidator = require("./utils/startupValidator");
const connectDB = require("./database");
const antiCrash = require("./handlers/antiCrash");

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

  await startupValidator(botConfig);

  await connectDB();

  const client = new Client({
    intents: Object.keys(GatewayIntentBits).filter((key) => isNaN(key)),
    partials: Object.keys(Partials).filter((key) => isNaN(key)),
  });

  antiCrash(client);

  eventHandler(client);
  
  client.login(process.env.TOKEN);
})();