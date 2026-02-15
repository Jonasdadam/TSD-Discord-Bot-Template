const { Events, EmbedBuilder } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");
const { logViaWebhook } = require("../../functions/logger");

module.exports = async (client, interaction) => {
	if (!interaction) return;
	if (!interaction.isChatInputCommand()) return;
	if (!interaction.guild) return;
	if (botConfig.logs.commands === false) return;

	try {
		const server = interaction.guild.name;
		const user = interaction.user.username;
		const userID = interaction.user.id;

		const embed = new EmbedBuilder()
			.setColor(botConfig.colors.main)
			.setTitle(`💻 Slashcommand Used!`)
			.addFields({ name: "Server", value: `${server}` })
			.addFields({ name: "Command", value: `/${interaction.commandName}` })
			.addFields({ name: "User", value: `${user} (${userID})` })
			.setTimestamp()
			.setFooter({ text: "Command logger", iconURL: botConfig.icons.logs });

		const webhookURL = process.env.commandLogWebhookURL;
		const avatar = botConfig.icons.logs;

		logViaWebhook(webhookURL, avatar, {
			username: "Command Logger",
			embeds: [embed.toJSON()],
		});
	} catch (error) {
		console.error("Error sending slashcommand log:", error);
	}
};
