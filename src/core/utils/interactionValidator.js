require("colors");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const { checkCooldown } = require("./cooldownManager");

module.exports = async (interaction, commandObject) => {
	const { user, member, guild } = interaction;
	const { ownerID, devIDs, devServerID } = botConfig.development;

	// Owner Only Check
	if (commandObject.ownerOnly && user.id !== ownerID) {
		await sendError(interaction, botConfig.messages.commandOwnerOnly);
		return false;
	}

	// Dev Only Check
	if (commandObject.devOnly && !devIDs.includes(user.id)) {
		await sendError(interaction, botConfig.messages.commandDevOnly);
		return false;
	}

	// Test Mode Check
	if (commandObject.testMode && guild?.id !== devServerID) {
		await sendError(interaction, botConfig.messages.commandTestMode);
		return false;
	}

	// Permissions Check (Only in guilds)
	if (guild) {
		// User Permissions
		if (commandObject.userPermissions?.length && !member.permissions.has(commandObject.userPermissions)) {
			await sendError(interaction, botConfig.messages.userNoPermissions);
			return false;
		}

		// Bot Permissions (Use appPermissions to respect channel overrides!)
		if (commandObject.botPermissions?.length && !interaction.appPermissions.has(commandObject.botPermissions)) {
			await sendError(interaction, botConfig.messages.botNoPermissions);
			return false;
		}
	}

	// Cooldown Check
	if (commandObject.cooldown) {
		const commandKey = commandObject.data?.name || commandObject.customId || "unknown_interaction";
		const remaining = checkCooldown(user.id, commandKey, commandObject.cooldown * 1000);

		if (remaining > 0) {
			const time = Math.ceil(remaining / 1000);
			await sendError(interaction, botConfig.messages.commandOnCooldown.replace("{time}", time));
			return false;
		}
	}

	return true;
};

async function sendError(interaction, description) {
	const embed = new EmbedBuilder().setColor(botConfig.colors.error).setDescription(description);

	// Use reply with ephemeral flag. Catch prevents errors if interaction has already been answered.
	return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral }).catch(() => {});
}