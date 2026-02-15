const cooldowns = new Map();

/**
 * Checks if a user is on cooldown for a specific command.
 * @param {string} userId Discord user ID.
 * @param {string} commandName Command name.
 * @param {number} cooldown Cooldown in milliseconds.
 * @returns {number} Time remaining in milliseconds, or 0 if no cooldown.
 */
function checkCooldown(userId, commandName, cooldown) {
	const now = Date.now();
	const key = `${userId}:${commandName}`;
	const expiration = cooldowns.get(key);

	if (expiration && now < expiration) {
		return expiration - now;
	}

	cooldowns.set(key, now + cooldown);
	return 0;
}

module.exports = { checkCooldown };
