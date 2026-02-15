require("colors");
const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const botConfig = require("../../../configs/botConfig.json");
const { ApplicationCommandType } = require("discord.js");

module.exports = async (client) => {
	try {
		const localCommands = await getLocalCommands();

		const globalCommands = await getApplicationCommands(client);
		const devCommands = await getApplicationCommands(client, botConfig.development.devServerID);

		const localGlobalNames = new Set();
		const localDevNames = new Set();

		for (const cmd of localCommands) {
			if (cmd.disabled) continue;

			if (cmd.ownerOnly || cmd.devOnly || cmd.testMode) {
				localDevNames.add(cmd.data.name);
			} else {
				localGlobalNames.add(cmd.data.name);
			}
		}

		for (const [id, cmd] of globalCommands.cache) {
			if (cmd.type !== ApplicationCommandType.ChatInput) continue;

			if (!localGlobalNames.has(cmd.name)) {
				await globalCommands.delete(id);
				console.log(`[COMMAND REGISTERY] Global command ${cmd.name} has been automatically removed.`.red);
			}
		}

		for (const [id, cmd] of devCommands.cache) {
			if (cmd.type !== ApplicationCommandType.ChatInput) continue;

			if (!localDevNames.has(cmd.name)) {
				await devCommands.delete(id);
				console.log(`[COMMAND REGISTERY] Dev command ${cmd.name} has been automatically removed.`.red);
			}
		}

		for (const localCommand of localCommands) {
			const { data, disabled } = localCommand;
			const { name: commandName } = data;

			const applicationCommands = localCommand.ownerOnly || localCommand.devOnly || localCommand.testMode ? devCommands : globalCommands;

			const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === commandName);

			if (disabled) {
				if (existingCommand) {
					await applicationCommands.delete(existingCommand.id);
					console.log(`[COMMAND REGISTERY] Application command ${commandName} has been deleted (disabled).`.red);
				} else {
					console.log(`[COMMAND REGISTERY] Application command ${commandName} has been skipped (disabled).`.grey);
				}
				continue;
			}

			if (existingCommand) {
				if (commandComparing(existingCommand, localCommand)) {
					const typeChanged = existingCommand.type !== (data.type || ApplicationCommandType.ChatInput);
					const contextsChanged = arraysChanged(existingCommand.contexts, data.contexts);
					const integrationsChanged = arraysChanged(existingCommand.integrationTypes, data.integration_types);

					if (typeChanged || contextsChanged || integrationsChanged) {
						await applicationCommands.delete(existingCommand.id);
						await applicationCommands.create(data);
					} else {
						await applicationCommands.edit(existingCommand.id, data);
					}

					console.log(`[COMMAND REGISTERY] Application command ${commandName} has been edited.`.yellow);
				}
			} else {
				await applicationCommands.create(data);
				console.log(`[COMMAND REGISTERY] Application command ${commandName} has been registered.`.green);
			}
		}
	} catch (err) {
		console.log(`[ERROR] An error occurred while registering commands!\n${err}`.red);
	}
};

function arraysChanged(arr1, arr2) {
	const a1 = arr1 || [];
	const a2 = arr2 || [];
	if (a1.length !== a2.length) return true;
	const s1 = [...a1].map(String).sort();
	const s2 = [...a2].map(String).sort();
	for (let i = 0; i < s1.length; i++) if (s1[i] !== s2[i]) return true;
	return false;
}
