require("colors");

const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getModals = require("../../utils/getModals");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  const modals = getModals();

  try {
    const modalObject = modals.find(
      (modal) => modal.customId === interaction.customId
    );
    if (!modalObject) return;

    if (modalObject.devOnly) {
      if (!botConfig.development.devIDs.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (modalObject.testMode) {
      if (interaction.guild.id !== botConfig.development.devServerID) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (modalObject.userPermissions?.length) {
      for (const permission of modalObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.userNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (modalObject.botPermissions?.length) {
      for (const permission of modalObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.botNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    await modalObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating modal commands!\n${err}`.red
    );
  }
};
