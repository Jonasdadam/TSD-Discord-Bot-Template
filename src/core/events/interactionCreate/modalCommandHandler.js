require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const getModals = require("../../utils/getModals");
const runValidation = require("../../utils/interactionValidator");
const logError = require("../../utils/errorLogger");
const botConfig = require("../../../configs/botConfig.json");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  const modals = getModals();

  try {
    const modalObject = modals.find(
      (modal) => modal.customId === interaction.customId
    );
    if (!modalObject) return;

    if (!(await runValidation(interaction, modalObject))) return;

    await modalObject.run(client, interaction);
  } catch (err) {
    console.log(`Error in modal ${interaction.customId}:`.red);
    console.error(err);

    logError(client, err, "Modal Error", interaction);

    const errorEmbed = new EmbedBuilder()
      .setColor(botConfig.colors.error || 0xff0000)
      .setTitle("❌ Oops!")
      .setDescription("Something went wrong while processing the modal. The developers have been notified.");

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
};