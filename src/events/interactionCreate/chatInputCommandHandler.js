require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const runValidation = require("../../utils/validation");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guild) {
    const rEmbed = new EmbedBuilder()
      .setColor(botConfig.messages.embedColorError)
      .setDescription("This command cannot be used in DMs.");
    return interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
  }
  
  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!commandObject) return;

    if (!(await runValidation(interaction, commandObject))) return;

    await commandObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating chat input commands!\n${err}`.red
    );
    console.log(err);
  }
};