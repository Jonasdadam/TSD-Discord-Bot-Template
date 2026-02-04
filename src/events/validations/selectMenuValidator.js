require("colors");

const { EmbedBuilder, Client, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getSelects = require("../../utils/getSelects");

/**
 *
 * @param {Client} client
 * @param {import("discord.js").AnySelectMenuInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  if (!interaction.isAnySelectMenu()) return;

  const selects = getSelects();

  try {
    const selectObject = selects.find(
      (select) => select.customId === interaction.customId
    );
    if (!selectObject) return;

    if (selectObject.devOnly) {
      if (!botConfig.development.devIDs.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (selectObject.testMode) {
      if (interaction.guild.id !== botConfig.development.devServerID) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (selectObject.userPermissions?.length) {
      for (const permission of selectObject.userPermissions) {
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

    if (selectObject.botPermissions?.length) {
      for (const permission of selectObject.botPermissions) {
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

    // if (interaction.message.interaction) {
    //   if (interaction.message.interaction.user.id !== interaction.user.id) {
    //     const rEmbed = new EmbedBuilder()
    //       .setColor(`${mConfig.embedColorError}`)
    //       .setDescription(`${mConfig.cannotUseSelect}`);
    //     interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
    //     return;
    //   }
    // }

    await selectObject.run(client, interaction);
  } catch (err) {
    console.log(`An error occurred while validating select menus!\n${err}`.red);
  }
};
