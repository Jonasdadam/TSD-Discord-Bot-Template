const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, MessageFlags, InteractionContextType, ApplicationIntegrationType } = require("discord.js");

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName("ExampleCTM")
		.setType(ApplicationCommandType.User)
		.setContexts(InteractionContextType.BotDM, InteractionContextType.Guild)
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

	disabled: false,
	ownerOnly: false,
	devOnly: false,
	testMode: false,
	cooldown: 5,
	userPermissions: [],
	botPermissions: [],	

	run: async (client, interaction) => {
		const embed = new EmbedBuilder()
		.setTitle("Context Menu Executed")
		.setDescription(`You used the context menu on ${interaction.targetUser.username}`)
		.setColor("Green");

		await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
	},
};
