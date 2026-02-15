require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const runValidation = require("../../utils/interactionValidator");
const logError = require("../../utils/errorLogger");

module.exports = async (client, interaction) => {
	if (!interaction.isContextMenuCommand()) return;

	const localContextMenus = getLocalContextMenus();

	try {
		const menuObject = localContextMenus.find((cmd) => cmd.data.name === interaction.commandName);
		if (!menuObject) return;

		if (!(await runValidation(interaction, menuObject))) return;

		await menuObject.run(client, interaction);
	} catch (err) {
		console.log(`Error in context menu ${interaction.commandName}:`.red);
		console.error(err);

		logError(client, err, "Context Menu Error", interaction);

		const errorEmbed = new EmbedBuilder()
			.setColor(botConfig.colors.error || 0xff0000)
			.setTitle("❌ Oops!")
			.setDescription("Something went wrong while executing this command. The developers have been notified.");

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
		} else {
			await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(() => {});
		}
	}
};
