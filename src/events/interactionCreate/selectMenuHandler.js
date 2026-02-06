require("colors");
const getSelects = require("../../utils/getSelects");
const runValidation = require("../../utils/validation");

module.exports = async (client, interaction) => {
  if (!interaction.isAnySelectMenu()) return;

  const selects = getSelects();

  try {
    const selectObject = selects.find(
      (select) => select.customId === interaction.customId
    );
    if (!selectObject) return;

    if (!(await runValidation(interaction, selectObject))) return;

    await selectObject.run(client, interaction);
  } catch (err) {
    console.log(`An error occurred while validating select menus!\n${err}`.red);
  }
};