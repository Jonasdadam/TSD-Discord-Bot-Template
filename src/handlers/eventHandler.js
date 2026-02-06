const path = require("path");
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    
    let eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    eventName === "validations" ? (eventName = "interactionCreate") : eventName;

    const eventFunctions = eventFiles.map((eventFile) => require(eventFile));

    client.on(eventName, async (...args) => {
      for (const eventFunction of eventFunctions) {
        await eventFunction(client, ...args);
      }
    });
  }
};