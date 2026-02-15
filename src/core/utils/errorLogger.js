const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
require("colors");

/**
 * @param {import("discord.js").Client} client
 * @param {Error} error
 * @param {string} type
 * @param {import("discord.js").BaseInteraction | import("discord.js").Message} [interaction]
 */
module.exports = async (client, error, type, interaction = null) => {
	try {
		const errorChannelID = botConfig.development?.errorChannelID;
		if (!errorChannelID) return;

		const errorChannel = await client.channels.fetch(errorChannelID).catch(() => null);
		if (!errorChannel) return;

		const errorStack = error.stack || error;
		const cleanError = errorStack.toString().substring(0, 3000);

		const embed = new EmbedBuilder().setTitle(`🚨 Error: ${type}`).setColor(0xff0000).setTimestamp().setFooter({ text: "Status: 🔴" });

		embed.setDescription(`\`\`\`js\n${cleanError}\n\`\`\``);

		if (interaction) {
			// Check whether it is a Message (Prefix command) or Interaction (Slash/Button)
			const user = interaction.user || interaction.author;
			const isMessage = !interaction.commandName && !interaction.customId && interaction.content;

			// Command Name determination
			let cmdName = "Unknown";
			if (isMessage) {
				cmdName = interaction.content.split(" ")[0];
			} else {
				cmdName = interaction.commandName || interaction.customId || "Unknown";
				const subCmd = interaction.options?.getSubcommand(false);
				if (subCmd) cmdName += ` ${subCmd}`;
			}

			const guildName = interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : "Direct Messages";
			const channelName = interaction.channel ? `${interaction.channel.name}` : "Unknown";
			const userTag = user ? `${user.tag} (${user.id})` : "Unknown User";

			embed.addFields({ name: "👤 User", value: `\`${userTag}\``, inline: true }, { name: "📍 Server", value: `\`${guildName}\`\nChannel: \`${channelName}\``, inline: true }, { name: "⚙️ Action/Command", value: `\`${cmdName}\``, inline: true });

			// Logging parameters (varies by type)
			if (!isMessage && interaction.options && interaction.options.data.length > 0) {
				const params = interaction.options.data.map((opt) => `${opt.name}: ${opt.value}`).join(", ");
				embed.addFields({ name: "📝 Parameters", value: `\`${params.substring(0, 1000)}\``, inline: false });
			} else if (isMessage && interaction.content) {
				embed.addFields({ name: "📝 Content", value: `\`${interaction.content.substring(0, 1000)}\``, inline: false });
			}
		} else {
			// No interaction provided (General error)
			const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
			const uptime = Math.floor(process.uptime());

			embed.addFields({ name: "💾 Memory", value: `\`${memoryUsage} MB\``, inline: true }, { name: "⏱️ Uptime", value: `\`${uptime} seconds\``, inline: true }, { name: "🤖 Node.js", value: `\`${process.version}\``, inline: true });
		}

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
			.setCustomId("crash_investigate")
			.setLabel("👀 Investigate")
			.setStyle(ButtonStyle.Primary),
			
			new ButtonBuilder()
			.setCustomId("crash_ignore")
			.setLabel("❌ Ignore")
			.setStyle(ButtonStyle.Secondary));

		await errorChannel.send({ embeds: [embed], components: [buttons] });
	} catch (logErr) {
		console.error("Error while logging an error:", logErr);
	}
};
