const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    MessageFlags
} = require("discord.js");
  
module.exports = {
    data: new ContextMenuCommandBuilder()
      .setName("ExampleCTM")
      .setType(ApplicationCommandType.User), // or ApplicationCommandType.Message
    
    // Configuration Options
    userPermissions: [], // e.g. [PermissionFlagsBits.Administrator]
    botPermissions: [],
    
    cooldown: 5,         // Cooldown in seconds
    disabled: false,     // If true, the command will be deleted/skipped
    devOnly: false,      // Only available to developers defined in botConfig
    ownerOnly: true,    // Only available to the owner
    testMode: false,      // Only registered in the Dev Server
  
    run: async (client, interaction) => {
        const embed = new EmbedBuilder()
            .setTitle("Context Menu Executed")
            .setDescription(`You used the context menu on ${interaction.targetUser.username}`)
            .setColor("Green");

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};