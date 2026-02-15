const getLocalCommands = require("../../utils/getLocalCommands");
const logError = require("../../utils/errorLogger");

module.exports = async (client, interaction) => {
	if (!interaction.isAutocomplete()) return;
	const localCommands = getLocalCommands();

	try {
		const commandObject = localCommands.find((cmd) => cmd.data.name === interaction.commandName);
		if (!commandObject) return;

		await commandObject.runAutocomplete(client, interaction);
	} catch (err) {
		console.error(`Error in autocomplete ${interaction.commandName}:`, err);
		logError(client, err, "Autocomplete Error", interaction);
	}
};
