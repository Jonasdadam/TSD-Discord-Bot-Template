require("colors");

const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const botConfig = require("../../../configs/botConfig.json");
const { ApplicationCommand, ApplicationCommandType } = require("discord.js");

module.exports = async (client) => {
  try {
    const localCommands = await getLocalCommands();
    
    const globalCommands = await getApplicationCommands(client);
    const devCommands = await getApplicationCommands(
      client,
      botConfig.development.devServerID
    );

    const localGlobalNames = new Set();
    const localDevNames = new Set();

      
      for (const cmd of localCommands) {
      if (cmd.devOnly || cmd.testMode) {
        localDevNames.add(cmd.data.name);
      } else {
        localGlobalNames.add(cmd.data.name);
      }
    }

    for (const [id, cmd] of globalCommands.cache) {
      if (cmd.type !== ApplicationCommandType.ChatInput) continue;
      
      if (!localGlobalNames.has(cmd.name)) {
        await globalCommands.delete(id);
        console.log(
          `[COMMAND REGISTERY] Application command ${cmd.name} has been automatically removed.`
            .red
        );
      }
    }

    for (const [id, cmd] of devCommands.cache) {
      if (!localDevNames.has(cmd.name)) {
        await devCommands.delete(id);
        console.log(
          `[COMMAND REGISTERY] Application command ${cmd.name} has been automatically removed.`
            .red
        );
      }
    }

    for (const localCommand of localCommands) {
      const { data, deleted } = localCommand;
      const { name: commandName } = data;

       const applicationCommands =
        localCommand.testMode || localCommand.devOnly
          ? devCommands
          : globalCommands;

      const existingCommand = applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );


      if (deleted) {
        if (existingCommand) {
          await applicationCommands.delete(existingCommand.id);
          console.log(
            `[COMMAND REGISTERY] Application command ${commandName} has been deleted.`
              .red
          );
        } else {
          console.log(
            `[COMMAND REGISTERY] Application command ${commandName} has been skipped, since property "deleted" is set to "true".`
              .grey
          );
        }
      } else if (existingCommand) {
        if (commandComparing(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            name: commandName,
            description: data.description,
            options: data.options,
          });
          console.log(
            `[COMMAND REGISTERY] Application command ${commandName} has been edited.`
              .yellow
          );
        }
      } else {
        await applicationCommands.create({
          name: commandName,
          description: data.description,
          options: data.options,
        });
        console.log(
          `[COMMAND REGISTERY] Application command ${commandName} has been registered.`
            .green
        );
      }
    }
  } catch (err) {
    console.log(`[ERROR] An error occurred while registering commands!\n${err}`.red);
  }
};
