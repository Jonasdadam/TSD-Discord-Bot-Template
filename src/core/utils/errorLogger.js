const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
require("colors");

/**
 * @param {import("discord.js").Client} client 
 * @param {Error} error 
 * @param {string} type
 * @param {import("discord.js").CommandInteraction} [interaction]
 */
module.exports = async (client, error, type, interaction = null) => {
  try {
    const errorChannelID = botConfig.development?.errorChannelID;
    if (!errorChannelID) return;

    const errorChannel = await client.channels.fetch(errorChannelID).catch(() => null);
    if (!errorChannel) return;

    const errorStack = error.stack || error;
    const cleanError = errorStack.toString().substring(0, 3000);

    const embed = new EmbedBuilder()
      .setTitle(`🚨 Error: ${type}`)
      .setColor(0xFF0000)
      .setTimestamp()
      .setFooter({ text: "Status: 🔴" });

    embed.setDescription(`\`\`\`js\n${cleanError}\n\`\`\``);

    if (interaction) {
      const cmdName = interaction.commandName || interaction.customId || "Unknown";
      const subCmd = interaction.options?.getSubcommand(false);
      const fullCmd = subCmd ? `${cmdName} ${subCmd}` : cmdName;
      
      const guildName = interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : "Direct Messages";
      const channelName = interaction.channel ? `${interaction.channel.name}` : "Unknown";
      const userName = `${interaction.user.tag} (${interaction.user.id})`;

      embed.addFields(
        { name: "👤 User", value: `\`${userName}\``, inline: true },
        { name: "📍 Server", value: `\`${guildName}\`\nChannel: \`${channelName}\``, inline: true },
        { name: "⚙️ Action/Command", value: `\`/${fullCmd}\``, inline: true }
      );

      if (interaction.options && interaction.options.data.length > 0) {
        const params = interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join(", ");
        embed.addFields({ name: "📝 Parameters", value: `\`${params.substring(0, 1000)}\``, inline: false });
      }
    } 

    else {
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const uptime = Math.floor(process.uptime());
      
      embed.addFields(
        { name: "💾 Memory", value: `\`${memoryUsage} MB\``, inline: true },
        { name: "⏱️ Uptime", value: `\`${uptime} seconden\``, inline: true },
        { name: "🤖 Node.js", value: `\`${process.version}\``, inline: true }
      );
    }


    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("crash_investigate").setLabel("👀 Investigate").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("crash_ignore").setLabel("❌ Ignore").setStyle(ButtonStyle.Secondary)
    );

    await errorChannel.send({ embeds: [embed], components: [buttons] });

  } catch (logErr) {
    console.error("Error while logging an error:", logErr);
  }
};