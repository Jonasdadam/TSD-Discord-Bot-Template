const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
  let localPrefixCommands = [];
  
  const commandCategories = getAllFiles(path.join(__dirname, "..", "..", "prefixCommands"), true);

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);

      if (exceptions.includes(commandObject.name)) continue;
      localPrefixCommands.push(commandObject);
    }
  }

  return localPrefixCommands;
};