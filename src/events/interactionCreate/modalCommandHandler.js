require("colors");
const getModals = require("../../utils/getModals");
const runValidation = require("../../utils/interactionValidator");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  const modals = getModals();

  try {
    const modalObject = modals.find(
      (modal) => modal.customId === interaction.customId
    );
    if (!modalObject) return;

    if (!(await runValidation(interaction, modalObject))) return;

    await modalObject.run(client, interaction);
  } catch (err) {
    console.log(
      `An error occurred while validating modal commands!\n${err}`.red
    );
  }
};