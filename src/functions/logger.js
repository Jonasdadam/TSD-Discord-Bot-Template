const { WebhookClient } = require('discord.js');
const Bottleneck = require('bottleneck');

const WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200,
});

const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

/**
 *
 * @param {Object} options
 *
 */
function logViaWebhook(options) {

  limiter.schedule(() => {
    return webhookClient.send(options);
  })
  .catch(err => {
    console.error('[Logger] Error sending webhook log:', err);
  });
}

module.exports = { logViaWebhook };