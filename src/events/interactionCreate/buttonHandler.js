require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const getButtons = require("../../utils/getButtons");
const runValidation = require("../../utils/interactionValidator");
const logError = require("../../utils/errorLogger");
const botConfig = require("../../configs/botConfig.json");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  const buttons = getButtons();

  try {
    const buttonObject = buttons.find((btn) => interaction.customId.startsWith(btn.customId));
    if (!buttonObject) return;

    if (!(await runValidation(interaction, buttonObject))) return;

    await buttonObject.run(client, interaction);
  } catch (err) {
    console.log(`Error in button ${interaction.customId}:`.red);
    console.error(err);

    logError(client, err, "Button Error", interaction);

    const errorEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color || 0xff0000)
      .setTitle("❌ Oops!")
      .setDescription("Something went wrong while executing this button. The developers have been notified.");

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
};