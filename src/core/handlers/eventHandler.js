const path = require("path");
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  const coreEventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);
  const userEventFolders = getAllFiles(path.join(__dirname, "..", "..", "events"), true);

  const allEventFolders = [...coreEventFolders, ...userEventFolders];

  for (const eventFolder of allEventFolders) {
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