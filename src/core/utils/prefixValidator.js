require("colors");
const { EmbedBuilder } = require("discord.js");
const botConfig = require("../../configs/botConfig.json");
const { checkCooldown } = require("./cooldownManager");

module.exports = async (message, commmand) => {
	const { author, guild, member } = message;
	const { ownerID, devIDs, devServerID } = botConfig.development;

	const isDevServer = guild?.id === devServerID;

	// Guild Only Check
	if (command.guildOnly && !message.guild) return false;

	// Test Mode Check
	if (command.testMode && !isDevServer) return false;

	// Owner Only Check
	if (command.ownerOnly && author.id !== ownerID) {
		if (isDevServer) await sendError(message, botConfig.messages.commandOwnerOnly);
		return false;
	}

	// Dev Only Check
	if (command.devOnly && !devIDs.includes(author.id)) {
		if (isDevServer) await sendError(message, botConfig.messages.commandDevOnly);
		return false;
	}

	// Permissions Checks
	if (guild) {
		// User Permissions Check
		if (command.userPermissions?.length && !member.permissions.has(command.userPermissions)) {
			await sendError(message, botConfig.messages.userNoPermissions);
			return false;
		}

		// Bot Permissions Check
		if (command.botPermissions?.length && !guild.members.me.permissions.has(command.botPermissions)) {
			await sendError(message, botConfig.messages.botNoPermissions);
			return false;
		}
	}

	// Cooldown Check
	if (command.cooldown) {
		const remaining = checkCooldown(author.id, command.name, command.cooldown * 1000);
		if (remaining > 0) {
			const time = Math.ceil(remaining / 1000);
			await sendError(message, botConfig.messages.commandOnCooldown.replace("{time}", time));
			return false;
		}
	}

	return true;
};

async function sendError(message, description) {
	const embed = new EmbedBuilder().setColor(botConfig.colors.error).setDescription(description);

	await message.reply({ embeds: [embed] }).catch(() => {});
}
