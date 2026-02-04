const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} = require("discord.js");
  
  module.exports = {
    data: new ContextMenuCommandBuilder()
      .setName("ExampleCTM")
      .setType(ApplicationCommandType.User),
    userPermissions: [],
    botPermissions: [],
    cooldown: 10,
  
    run: async (client, interaction) => {
      
    },
  };
  