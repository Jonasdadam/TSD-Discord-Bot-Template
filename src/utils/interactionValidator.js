require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../configs/botConfig.json");
const { checkCooldown } = require("./cooldownManager");

/**
 * Performs standard validations for an interaction (command, button, menu, etc.)
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {Object} commandObject - The command/button/menu object from the file
 * @returns {Promise<boolean>} - Returns true if validation succeeds, false if it fails.
 */
module.exports = async (interaction, commandObject) => {
  // Dev Only Check
  if (commandObject.devOnly) {
    if (!botConfig.development.devIDs.includes(interaction.member.id)) {
      const rEmbed = new EmbedBuilder()
        .setColor(`${botConfig.bot_colors.error_color}`)
        .setDescription(`${botConfig.messages.commandDevOnly}`);
      await interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
      return false;
    }
  }

  // Test Mode Check
  if (commandObject.testMode) {
    if (interaction.guild.id !== botConfig.development.devServerID) {
      const rEmbed = new EmbedBuilder()
        .setColor(`${botConfig.bot_colors.error_color}`)
        .setDescription(`${botConfig.messages.commandTestMode}`);
      await interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
      return false;
    }
  }

  // User Permissions Check
  if (commandObject.userPermissions?.length) {
    for (const permission of commandObject.userPermissions) {
      if (interaction.member.permissions.has(permission)) {
        continue;
      }
      const rEmbed = new EmbedBuilder()
        .setColor(`${botConfig.bot_colors.error_color}`)
        .setDescription(`${botConfig.messages.userNoPermissions}`);
      await interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
      return false;
    }
  }

  // Bot Permissions Check
  if (commandObject.botPermissions?.length) {
    for (const permission of commandObject.botPermissions) {
      const bot = interaction.guild.members.me;
      if (bot.permissions.has(permission)) {
        continue;
      }
      const rEmbed = new EmbedBuilder()
        .setColor(`${botConfig.bot_colors.error_color}`)
        .setDescription(`${botConfig.messages.botNoPermissions}`);
      await interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
      return false;
    }
  }

  // Cooldown Check
  if (commandObject.cooldown) {
    // Use command name OR customId as key for the cooldown
    const commandKey = commandObject.data?.name || commandObject.customId || "unknown_command";
    
    const remaining = checkCooldown(
      interaction.user.id,
      commandKey,
      commandObject.cooldown * 1000
    );
    
    if (remaining > 0) {
      const rEmbed = new EmbedBuilder()
        .setColor(`${botConfig.bot_colors.error_color}`)
        .setDescription(
          botConfig.messages.commandOnCooldown.replace(
            "{time}",
            Math.ceil(remaining / 1000)
          )
        );
      await interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
      return false;
    }
  }

  return true;
};