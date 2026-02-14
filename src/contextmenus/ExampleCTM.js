const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    MessageFlags,
    InteractionContextType, ApplicationIntegrationType
} = require("discord.js");
  
module.exports = {
    data: new ContextMenuCommandBuilder()
      .setName("ExampleCTM")
      .setType(ApplicationCommandType.User) // or ApplicationCommandType.Message
      .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild) // Only allow in Guilds
      .setIntegrationTypes(ApplicationIntegrationType.GuildInstall), // Only allow via Guild Install
    
    userPermissions: [], // e.g. [PermissionFlagsBits.Administrator]
    botPermissions: [],

    cooldown: 5,         // Cooldown in seconds
    disabled: false,     // If true, the command will be deleted/skipped
    devOnly: false,      // Only available to developers defined in botConfig, Only registered in the Dev Server
    ownerOnly: false,    // Only available to the owner, Only registered in the Dev Server
    testMode: false,      // Only registered in the Dev Server
  
    run: async (client, interaction) => {
        const embed = new EmbedBuilder()
            .setTitle("Context Menu Executed")
            .setDescription(`You used the context menu on ${interaction.targetUser.username}`)
            .setColor("Green");

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};