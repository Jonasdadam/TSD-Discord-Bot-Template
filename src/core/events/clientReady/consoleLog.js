require("colors");

module.exports = async (client) => {
  console.log(`\n[${(client.user.username).toUpperCase()}] 🤖 ${client.user.username} is online.\n`.blue);
};