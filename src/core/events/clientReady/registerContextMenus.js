require("colors");
const { ApplicationCommandType } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const commandComparing = require("../../utils/commandComparing");

module.exports = async (client) => {
	try {
		const localContextMenus = await getLocalContextMenus();

		const globalCommands = await getApplicationCommands(client);
		const devCommands = await getApplicationCommands(client, botConfig.development.devServerID);

		const localGlobalNames = new Set();
		const localDevNames = new Set();

		for (const menu of localContextMenus) {
			if (menu.disabled) continue;

			if (menu.ownerOnly || menu.devOnly || menu.testMode) {
				localDevNames.add(menu.data.name);
			} else {
				localGlobalNames.add(menu.data.name);
			}
		}

		for (const [id, cmd] of globalCommands.cache) {
			if (cmd.type === ApplicationCommandType.ChatInput) continue;

			if (!localGlobalNames.has(cmd.name)) {
				await globalCommands.delete(id);
				console.log(`[CONTEXT MENU] Global command ${cmd.name} has been automatically removed.`.red);
			}
		}

		for (const [id, cmd] of devCommands.cache) {
			if (cmd.type === ApplicationCommandType.ChatInput) continue;

			if (!localDevNames.has(cmd.name)) {
				await devCommands.delete(id);
				console.log(`[CONTEXT MENU] Dev command ${cmd.name} has been automatically removed.`.red);
			}
		}

		for (const localMenu of localContextMenus) {
			const { data, disabled, ownerOnly, devOnly, testMode } = localMenu;
			const { name: menuName } = data;

			const applicationCommands = ownerOnly || devOnly || testMode ? devCommands : globalCommands;

			const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === menuName);

			if (disabled) {
				if (existingCommand) {
					await applicationCommands.delete(existingCommand.id);
					console.log(`[CONTEXT MENU] Application command ${menuName} has been deleted (disabled).`.red);
				} else {
					console.log(`[CONTEXT MENU] Application command ${menuName} has been skipped (disabled).`.grey);
				}
				continue;
			}

			if (existingCommand) {
				if (commandComparing(existingCommand, localMenu)) {
					const typeChanged = existingCommand.type !== data.type;
					const contextsChanged = arraysChanged(existingCommand.contexts, data.contexts);
					const integrationsChanged = arraysChanged(existingCommand.integrationTypes, data.integration_types);

					if (typeChanged || contextsChanged || integrationsChanged) {
						await applicationCommands.delete(existingCommand.id);
						await applicationCommands.create(data);
					} else {
						await applicationCommands.edit(existingCommand.id, data);
					}

					console.log(`[CONTEXT MENU] Application command ${menuName} has been edited.`.yellow);
				}
			} else {
				await applicationCommands.create(data);
				console.log(`[CONTEXT MENU] Application command ${menuName} has been registered.`.green);
			}
		}
	} catch (err) {
		console.log(`[ERROR] An error occurred while registering context menus!\n${err}`.red);
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
