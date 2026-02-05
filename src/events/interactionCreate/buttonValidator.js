require("colors");

const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getButtons = require("../../utils/getButtons");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  const buttons = getButtons();

  try {
    const buttonObject = buttons.find((btn) => interaction.customId.startsWith(btn.customId));
    if (!buttonObject) return;

    if (buttonObject.devOnly) {
      if (!botConfig.development.devIDs.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      };
    };

    if (buttonObject.testMode) {
      if (interaction.guild.id !== botConfig.development.devServerID) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      };
    };

    if (buttonObject.userPermissions?.length) {
      for (const permission of buttonObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        };
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.userNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      };
    };

    if (buttonObject.botPermissions?.length) {
      for (const permission of buttonObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) {
          continue;
        };
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      };
    };

    await buttonObject.run(client, interaction);
  } catch (err) {
    console.log(`An Button error occurred!\n${err}`.red);
  };
};