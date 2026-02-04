require("colors");

const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const { checkCooldown } = require("../../utils/cooldownManager");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check of de command gebruikt wordt in een DM
  if (!interaction.guild) {
    const rEmbed = new EmbedBuilder()
      .setColor(botConfig.messages.embedColorError)
      .setDescription("Deze command kan niet gebruikt worden in DMs.");
    return interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
  }
  
  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!botConfig.development.devIDs.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }


    if (commandObject.testMode) {
      if (interaction.guild.id !== botConfig.development.devServerID) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${botConfig.messages.embedColorError}`)
          .setDescription(`${botConfig.messages.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    if (commandObject.userPermissions?.length) {
      for (const permission of commandObject.userPermissions) {
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

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
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

     if (commandObject.cooldown) {
      const remaining = checkCooldown(
        interaction.user.id,
        interaction.commandName,
        commandObject.cooldown * 1000
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

    await commandObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating chat input commands!\n${err}`.red
    );
    console.log(err);
  }
};
