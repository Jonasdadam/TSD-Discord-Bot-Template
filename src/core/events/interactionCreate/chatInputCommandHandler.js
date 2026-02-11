require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const runValidation = require("../../utils/interactionValidator");
const logError = require("../../utils/errorLogger");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guild) {
    const rEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color)
      .setDescription("This command cannot be used in DMs.");
    return interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
  }
  
  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!commandObject) return;

    if (!(await runValidation(interaction, commandObject))) return;

    await commandObject.run(client, interaction);

  } catch (err) {
    console.log(`Error in command ${interaction.commandName}:`.red);
    console.error(err);

    logError(client, err, "Command Error", interaction);

    const errorEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color || 0xff0000)
      .setTitle("❌ Oops!")
      .setDescription("Something went wrong while executing this command. The developers have been notified.");

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
};