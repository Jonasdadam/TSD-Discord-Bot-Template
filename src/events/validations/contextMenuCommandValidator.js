require("colors");

const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const { checkCooldown } = require("../../utils/cooldownManager");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand()) return;

  if (!interaction.guild) {
    const rEmbed = new EmbedBuilder()
      .setColor(botConfig.messages.embedColorError)
      .setDescription("Deze command kan niet gebruikt worden in DMs.");
    return interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
  }

  const localContextMenus = getLocalContextMenus();

  try {
    const menuObject = localContextMenus.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!menuObject) return;

    if (menuObject.devOnly) {
      if (!botConfig.development.devIDs.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (menuObject.testMode) {
      if (interaction.guild.id !== botConfig.development.devServerID) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (menuObject.userPermissions?.length) {
      for (const permission of menuObject.userPermissions) {
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

    if (menuObject.botPermissions?.length) {
      for (const permission of menuObject.botPermissions) {
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

    if (menuObject.cooldown) {
      const remaining = checkCooldown(
        interaction.user.id,
        interaction.commandName,
        menuObject.cooldown * 1000
      );
      if (remaining > 0) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(
            botConfig.messages.commandOnCooldown.replace(
              "{time}",
              Math.ceil(remaining / 1000)
            )
          );
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    await menuObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating context menu's!\n${err}`.red
    );
  }
};
