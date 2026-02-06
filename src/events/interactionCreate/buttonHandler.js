require("colors");
const getButtons = require("../../utils/getButtons");
const runValidation = require("../../utils/validation");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  const buttons = getButtons();

  try {
    const buttonObject = buttons.find((btn) => interaction.customId.startsWith(btn.customId));
    if (!buttonObject) return;

    if (!(await runValidation(interaction, buttonObject))) return;

    await buttonObject.run(client, interaction);
  } catch (err) {
    console.log(`An Button error occurred!\n${err}`.red);
  };
};