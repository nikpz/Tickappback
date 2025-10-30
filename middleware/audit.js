const logger = require("../utils/logger");

function audit(socket, event, payload) {
  logger.info(`[AUDIT] ${event} by ${socket.user?.id}`, payload);
}

module.exports = { audit };


