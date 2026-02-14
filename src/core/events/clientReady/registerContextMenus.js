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
    const devCommands = await getApplicationCommands(
      client,
      botConfig.development.devServerID
    );

    const localGlobalNames = new Set();
    const localDevNames = new Set();

    // Sort local menus into Dev or Global buckets
    for (const menu of localContextMenus) {
      if (menu.disabled) continue;

      if (menu.ownerOnly || menu.devOnly || menu.testMode) {
        localDevNames.add(menu.data.name);
      } else {
        localGlobalNames.add(menu.data.name);
      }
    }

    // Cleanup Global Commands (Context Menus only)
    for (const [id, cmd] of globalCommands.cache) {
      // Skip ChatInput (Slash Commands) to avoid deleting them
      if (cmd.type === ApplicationCommandType.ChatInput) continue; 

      if (!localGlobalNames.has(cmd.name)) {
        await globalCommands.delete(id);
        console.log(`[CONTEXT MENU] Global command ${cmd.name} has been automatically removed.`.red);
      }
    }

    // Cleanup Dev Commands (Context Menus only)
    for (const [id, cmd] of devCommands.cache) {
      // Skip ChatInput (Slash Commands)
      if (cmd.type === ApplicationCommandType.ChatInput) continue;

      if (!localDevNames.has(cmd.name)) {
        await devCommands.delete(id);
        console.log(`[CONTEXT MENU] Dev command ${cmd.name} has been automatically removed.`.red);
      }
    }

    // Register or Update Local Menus
    for (const localMenu of localContextMenus) {
      const { data, disabled, ownerOnly, devOnly, testMode } = localMenu;
      const { name: menuName } = data;

      // Determine target collection (Dev or Global)
      const applicationCommands =
        ownerOnly || devOnly || testMode
          ? devCommands
          : globalCommands;

      const existingCommand = applicationCommands.cache.find(
        (cmd) => cmd.name === menuName
      );

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
          await applicationCommands.edit(existingCommand.id, {
            name: menuName,
            type: data.type,
          });
          console.log(`[CONTEXT MENU] Application command ${menuName} has been edited.`.yellow);
        }
      } else {
        await applicationCommands.create({
          name: menuName,
          type: data.type,
        });
        console.log(`[CONTEXT MENU] Application command ${menuName} has been registered.`.green);
      }
    }

  } catch (err) {
    console.log(`[ERROR] An error occurred while registering context menus!\n${err}`.red);
  }
};