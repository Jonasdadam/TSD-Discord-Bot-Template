require("colors");
const { EmbedBuilder } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");
const getLocalPrefixCommands = require("../../utils/getLocalPrefixCommands");
const runValidation = require("../../utils/prefixValidator");
const logError = require("../../utils/errorLogger");

module.exports = async (client, message) => {
  // Basic checks
  if (message.author.bot) return;

  const prefix = botConfig.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const localPrefixCommands = getLocalPrefixCommands();
  const commandObject = localPrefixCommands.find(
    (cmd) => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))
  );

  if (!commandObject) return;

  // Disabled check
  if (commandObject.disabled) return;

  try {
    // Run validation (Permissions, Cooldowns, Dev/Owner checks)
    if (!(await runValidation(message, commandObject))) return;

    // Execute the command
    await commandObject.run(client, message, args);

  } catch (err) {
    console.log(`Error in prefix command ${commandObject.name}:`.red);
    console.error(err);

    logError(client, err, "Prefix Command Error", message);

    const errorEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color || 0xff0000)
      .setTitle("❌ Oops!")
      .setDescription("Something went wrong while executing this command. The developers have been notified.");

    await message.reply({ embeds: [errorEmbed] }).catch(() => {});
  }
};