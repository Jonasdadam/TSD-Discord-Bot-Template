const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping the bot to see if it's online.")
    .setDMPermission(false)
    .toJSON(),
  deleted: false,
  devOnly: false,
  testMode: true,
  cooldown: 3,
  userPermissions: [],
  botPermissions: [],

  run: (client, interaction) => {
    return interaction.reply({ content: "🏓 Pong!", flags: MessageFlags.Ephemeral });
  },
};