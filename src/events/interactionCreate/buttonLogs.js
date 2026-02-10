const { EmbedBuilder } = require('discord.js');
const botConfig = require('../../configs/botConfig.json');
const { logViaWebhook } = require('../../functions/logger');

/**
 * 
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isButton() || !interaction.guild) return;

  if (!botConfig.logs.buttonlogger) return;

  if (interaction.customId.startsWith("crash_")) return;

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


    const webhookURL = process.env.buttonLogWebhookURL;
        const avatar = botConfig.bot_icons.log_icon;

        logViaWebhook(webhookURL, avatar, {
            username: 'Button Logger',
            embeds: [embed.toJSON()]
        });
  } catch (error) {
    console.error('Error sending button log:', error);
  }
};
