const { SlashCommandBuilder, MessageFlags, InteractionContextType, ApplicationIntegrationType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping the bot to see if it's online.")
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setNSFW(true)
    .toJSON(),
  disabled: false,
  devOnly: false,
  testMode: false,
  ownerOnly: false,
  cooldown: 3,
  userPermissions: [],
  botPermissions: [],

  run: (client, interaction) => {
    return interaction.reply({ content: "🏓 Pong!", flags: MessageFlags.Ephemeral });
  },
};