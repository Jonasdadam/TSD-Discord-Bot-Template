require("colors");

const botConfig = require("../../../configs/botConfig.json");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const commandComparing = require("../../utils/commandComparing");

module.exports = async (client) => {
  try {
    const localContextMenus = await getLocalContextMenus();
    let applicationContextMenus;

    for (const localContextMenu of localContextMenus) {
      const { data, disabled, ownerOnly, devOnly, testMode } = localContextMenu;

      const contextMenuName = data.name;
      const contextMenuType = data.type;

      if (testMode || devOnly || ownerOnly) {
        applicationContextMenus = await getApplicationContextMenus(client, botConfig.development.devServerID);
      } else {
        applicationContextMenus = await getApplicationContextMenus(client);
      }

      const existingContextMenu = await applicationContextMenus.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (existingContextMenu) {
        if (disabled) {
          await applicationContextMenus.delete(existingContextMenu.id);
          console.log(`[CONTEXT MENU] Application command ${contextMenuName} has been deleted.`.red);
          continue;
        }

        if (commandComparing(existingContextMenu, localContextMenu)) {
            await applicationContextMenus.edit(existingContextMenu.id, {
                name: contextMenuName,
                type: contextMenuType,
            });
            console.log(`[CONTEXT MENU] Application command ${contextMenuName} has been edited.`.yellow);
        }

      } else {
        if (disabled) {
          console.log(`[CONTEXT MENU] Application command ${contextMenuName} has been skipped (disabled).`.grey);
          continue;
        }

        await applicationContextMenus.create({
          name: contextMenuName,
          type: contextMenuType,
        });
        console.log(`[CONTEXT MENU] Application command ${contextMenuName} has been registered.`.green);
      }
    }
  } catch (err) {
    console.log(`An error occurred while registering context menu's!\n${err}`.red);
  }
};