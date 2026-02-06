require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const runValidation = require("../../utils/validation");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand()) return;

  if (!interaction.guild) {
    const rEmbed = new EmbedBuilder()
      .setColor(botConfig.bot_colors.error_color)
      .setDescription("This command cannot be used in DMs.");
    return interaction.reply({ embeds: [rEmbed], flags: MessageFlags.Ephemeral });
  }

  const localContextMenus = getLocalContextMenus();

  try {
    const menuObject = localContextMenus.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!menuObject) return;

    // Alle checks (devOnly, permissions, cooldowns) via de centrale validator
    if (!(await runValidation(interaction, menuObject))) return;

    await menuObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating context menu's!\n${err}`.red
    );
  }
};