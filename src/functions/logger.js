const { WebhookClient } = require('discord.js');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200,
});

/**
 * @param {string} url
 * @param {Object} options
 */
function logViaWebhook(url, options) {
  if (!url) return;

  const webhookClient = new WebhookClient({ url });

  limiter.schedule(() => {
    return webhookClient.send(options);
  })
  .catch(err => {
    console.error('[Logger] Error sending webhook log:', err);
  });
}

module.exports = { logViaWebhook };