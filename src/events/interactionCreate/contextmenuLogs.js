const { EmbedBuilder } = require('discord.js');
const botConfig = require('../../configs/botConfig.json');
const { logViaWebhook } = require('../../functions/logger');

/**
 * 
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand() || !interaction.guild) return;

  if (!botConfig.logs.contextlogger) return;

  try {
    const contextEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.main_color)
      .setTitle('📋 Contextmenu Command Used!')
      .addFields(
        { name: 'Server',   value: interaction.guild.name, inline: false },
        { name: 'Contextmenu',  value: interaction.commandName, inline: false },
        { name: 'User',value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Contextmenu Logger', iconURL: botConfig.bot_icons.log_icon });


    const webhookURL = process.env.contextLogWebhookURL;
    const avatar = botConfig.bot_icons.command_log_icon;

    logViaWebhook(webhookURL, avatar, {
        username: 'Contextmenu Logger',
        embeds: [embed.toJSON()]
    });
  } catch (error) {
    console.error('Error sending contextmenu log:', error);
  }
};
