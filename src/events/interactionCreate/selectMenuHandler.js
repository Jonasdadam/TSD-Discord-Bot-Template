require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const getSelects = require("../../utils/getSelects");
const runValidation = require("../../utils/interactionValidator");
const logError = require("../../utils/errorLogger");
const botConfig = require("../../configs/botConfig.json");

module.exports = async (client, interaction) => {
  if (!interaction.isAnySelectMenu()) return;

  const selects = getSelects();

  try {
    const selectObject = selects.find(
      (select) => select.customId === interaction.customId
    );
    if (!selectObject) return;

    if (!(await runValidation(interaction, selectObject))) return;

    await selectObject.run(client, interaction);
  } catch (err) {
    console.log(`Error in select menu ${interaction.customId}:`.red);
    console.error(err);

    logError(client, err, "Select Menu Error", interaction);

    const errorEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color || 0xff0000)
      .setTitle("❌ Oops!")
      .setDescription("Something went wrong while processing your selection. The developers have been notified.");

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
};