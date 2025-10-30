const { Audit } = require("../models");
const { v4: uuidv4 } = require("uuid");

module.exports = (socket) => {
  // When client emits an audit log
  socket.on("audit:log", async (data) => {
    try {
      const { entityId, entityType, action, userId, timestamp, meta } = data;

      const log = await Audit.create({
        id: uuidv4(),
        entity_id: entityId,
        entity_type: entityType,
        action,
        user_id: userId || "system",
        timestamp: timestamp || Date.now(),
        meta: meta || {},
      });

      // Broadcast new log to all clients
      socket.broadcast.emit("audit:created", log.toJSON());
    } catch (err) {
      console.error("❌ Failed to save audit log:", err);
    }
  });

  // Optional: allow fetching all audit logs
  socket.on("audit:list", async (_, callback) => {
    try {
      const logs = await Audit.findAll({ order: [["timestamp", "DESC"]] });
      callback?.({ ok: true, logs });
    } catch (err) {
      console.error("❌ Failed to fetch audit logs:", err);
      callback?.({ ok: false, error: err.message });
    }
  });
};
