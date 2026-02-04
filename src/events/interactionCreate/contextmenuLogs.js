const { EmbedBuilder } = require('discord.js');
const botConfig = require('../../configs/botConfig.json');
const axios = require('axios');

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

    const payload = {
      username:   'Contextmenu Logger',
      avatar_url: botConfig.bot_icons.log_icon,
      embeds:     [contextEmbed.toJSON()]
    };

    await axios.post(process.env.contextLogWebhookURL, payload);
  } catch (error) {
    console.error('Error sending contextmenu log:', error);
  }
};
