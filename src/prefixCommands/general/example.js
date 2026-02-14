const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Check the bot's latency",
  aliases: ["p", "latency"],
  
  disabled: false,
  devOnly: true,
  testMode: false,
  ownerOnly: false,
  guildOnly: false,
  cooldown: 5,
  userPermissions: [],
  botPermissions: [PermissionFlagsBits.SendMessages],

  run: async (client, message, args) => {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`🏓 Pong! Latency: ${client.ws.ping}ms`);

    await message.reply({ embeds: [embed] });
  },
};