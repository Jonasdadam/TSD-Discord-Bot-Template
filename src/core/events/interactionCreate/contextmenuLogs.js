const { EmbedBuilder } = require('discord.js');
const botConfig = require('../../../configs/botConfig.json');
const { logViaWebhook } = require('../../functions/logger');

/**
 * 
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand() || !interaction.guild) return;

  if (!botConfig.logs.contextMenus) return;

  try {
    const contextEmbed = new EmbedBuilder()
      .setColor(botConfig.colors.main)
      .setTitle('📋 Contextmenu Command Used!')
      .addFields(
        { name: 'Server',   value: interaction.guild.name, inline: false },
        { name: 'Contextmenu',  value: interaction.commandName, inline: false },
        { name: 'User',value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Contextmenu Logger', iconURL: botConfig.icons.logs });


    const webhookURL = process.env.contextLogWebhookURL;
    const avatar = botConfig.icons.command_logs;

    logViaWebhook(webhookURL, avatar, {
        username: 'Contextmenu Logger',
        embeds: [contextEmbed.toJSON()]
    });
  } catch (error) {
    console.error('Error sending contextmenu log:', error);
  }
};
