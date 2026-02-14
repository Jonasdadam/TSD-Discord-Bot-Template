require("dotenv/config");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const eventHandler = require("./core/handlers/eventHandler");
const botConfig = require("./configs/botConfig.json");
const startupValidator = require("./core/utils/startupValidator");
const connectDB = require("./core/database");
const antiCrash = require("./core/handlers/antiCrash");

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
    intents: Object.keys(GatewayIntentBits).map((key) => GatewayIntentBits[key]),
    partials: Object.keys(Partials).map((key) => Partials[key]),
  });

  antiCrash(client);

  eventHandler(client);
  
  client.login(process.env.TOKEN);
})();