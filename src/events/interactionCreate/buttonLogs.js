const { EmbedBuilder } = require('discord.js');
const botConfig = require('../../configs/botConfig.json');
const axios = require('axios');

/**
 * 
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isButton() || !interaction.guild) return;

  if (!botConfig.logs.buttonlogger) return;

  try {
    const buttonEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.main_color)
      .setTitle('🖱️ Button Used!')
      .addFields(
        { name: 'Server',   value: interaction.guild.name, inline: false },
        { name: 'Button ID', value: interaction.customId, inline: false },
        { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Button Logger', iconURL: botConfig.bot_icons.log_icon });

    const payload = {
      username:   'Button Logger',
      avatar_url: botConfig.bot_icons.log_icon,
      embeds:     [buttonEmbed.toJSON()]
    };

    await axios.post(process.env.buttonLogWebhookURL, payload);
  } catch (error) {
    console.error('Error sending button log:', error);
  }
};
