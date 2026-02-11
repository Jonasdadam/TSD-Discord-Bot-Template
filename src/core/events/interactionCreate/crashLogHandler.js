const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const botConfig = require("../../../configs/botConfig.json");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("crash_")) return;

  if (!botConfig.development.devIDs.includes(interaction.user.id)) {
    return interaction.reply({ 
        content: "🚫 Only developers can manage crash logs.", 
        flags: MessageFlags.Ephemeral 
    });
  }

  if (interaction.customId === "crash_ignore" || interaction.customId === "crash_delete") {
    await interaction.message.delete();
    return;
  }

  const message = interaction.message;
  const originalEmbed = message.embeds[0];
  const newEmbed = EmbedBuilder.from(originalEmbed);
  
  let newStatusText = "";
  let newColor = "";
  let newComponents = [];

  switch (interaction.customId) {
    case "crash_investigate":
      newColor = 0xFFA500;
      newStatusText = `Status: 👀 is being investigated by ${interaction.user.username}`;
      
      newComponents = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("crash_fixed")
            .setLabel("✅ Fixed")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("crash_unknown")
            .setLabel("🤷‍♂️ Unknown/No Solution")
            .setStyle(ButtonStyle.Danger)
        )
      ];
      break;
    
    case "crash_fixed":
      newColor = 0x00FF00;
      newStatusText = `Status: ✅ Resolved by ${interaction.user.username}`;
      
      newComponents = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("crash_delete")
            .setLabel("🗑️")
            .setStyle(ButtonStyle.Secondary)
        )
      ];
      break;

    case "crash_unknown":
      newColor = 0x000000;
      newStatusText = `Status: 🤷‍♂️ Unknown/No solution, marked by ${interaction.user.username}`;
      
      newComponents = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("crash_delete")
            .setLabel("🗑️")
            .setStyle(ButtonStyle.Secondary)
        )
      ];
      break;
  }

  if (newColor) newEmbed.setColor(newColor);
  if (newStatusText) newEmbed.setFooter({ text: newStatusText });

  await interaction.update({ embeds: [newEmbed], components: newComponents });
};