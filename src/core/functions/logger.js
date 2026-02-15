const { WebhookClient } = require("discord.js");
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
	maxConcurrent: 1,
	minTime: 200,
});

function logViaWebhook(url, avatarURL, options) {
	if (!url) return;

	const webhookClient = new WebhookClient({ url });

	limiter
		.schedule(() => {
			return webhookClient.send({
				...options,
				avatarURL: avatarURL || undefined,
			});
		})
		.catch((err) => {
			console.error("[Logger] Error sending webhook log:", err);
		});
}

module.exports = { logViaWebhook };
