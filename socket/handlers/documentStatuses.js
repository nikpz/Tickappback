const { v4: uuidv4 } = require("uuid");
const models = require("../../models");
const { DocumentStatus } = models;
const { audit } = require("../../middleware/audit");

module.exports = function documentStatuses(socket) {
  // 🔹 1. Create a new status
  socket.on("documentStatuses:create", async (payload, ack) => {
    try {
      audit(socket, "documentStatuses:create", payload);

      const { label, color, text_color } = payload || {};
      const status = await DocumentStatus.create({
        id: uuidv4(),
        label,
        color,
        text_color,
      });

      ack && ack({ ok: true, status });
      socket.emit("documentStatuses:created", status);
      socket.broadcast.emit("documentStatuses:created", status);
    } catch (err) {
      console.error("documentStatuses:create", err);
      ack && ack({ ok: false, error: "server_error in documentStatuses:create" });
    }
  });

  // 🔹 2. Update a status
  socket.on("documentStatuses:update", async (payload, ack) => {
    try {
      audit(socket, "documentStatuses:update", payload);

      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await DocumentStatus.update(updates, { where: { id } });
      const updated = await DocumentStatus.findByPk(id);

      ack && ack({ ok: true, status: updated });
      socket.emit("documentStatuses:updated", updated);
      socket.broadcast.emit("documentStatuses:updated", updated);
    } catch (err) {
      console.error("documentStatuses:update", err);
      ack && ack({ ok: false, error: "server_error in documentStatuses:update" });
    }
  });

  // 🔹 3. Delete a status
  socket.on("documentStatuses:delete", async ({ id }, ack) => {
    try {
      audit(socket, "documentStatuses:delete", { id });
      await DocumentStatus.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("documentStatuses:deleted", { id });
      socket.broadcast.emit("documentStatuses:deleted", { id });
    } catch (err) {
      console.error("documentStatuses:delete", err);
      ack && ack({ ok: false, error: "server_error in documentStatuses:delete" });
    }
  });

  // 🔹 4. Set / replace all statuses
  socket.on("documentStatuses:set", async (list, ack) => {
    try {
      audit(socket, "documentStatuses:set", list);
      ack && ack({ ok: true });
      socket.emit("documentStatuses:set", list);
      socket.broadcast.emit("documentStatuses:set", list);
    } catch (err) {
      console.error("documentStatuses:set", err);
      ack && ack({ ok: false, error: "server_error in documentStatuses:set" });
    }
  });

  // 🔹 5. List all statuses
  socket.on("documentStatuses:list", async (payload, ack) => {
    try {
      audit(socket, "documentStatuses:list", payload);
      const statuses = await DocumentStatus.findAll({ order: [["created_at", "ASC"]] });
      ack && ack({ ok: true, statuses });
      if (ack) ack(statuses);
      socket.emit("documentStatuses:list", statuses);
    } catch (err) {
      console.error("documentStatuses:list", err);
      ack && ack({ ok: false, error: "server_error in documentStatuses:list" });
      if (ack) ack([]);

    }
  });
};
