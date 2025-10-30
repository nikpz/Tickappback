const { v4: uuidv4 } = require("uuid");
const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function processes(socket) {
  const { Process, User } = models;

  socket.on("processes:set", (data) => {
    audit(socket, "processes:set", data);
    socket.emit("processes:set", data);
  });
  socket.on("processes:list", async (params, ack) => {
    audit(socket, "processes:list", params);
    try {
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { ownerOnly = false, includeVariables = false } = params || {};
      const where = {};
      if (ownerOnly) where.owner_id = socket.user.id;

      const processes = await models.Process.findAll({
        where,
        include: [
          includeVariables && { model: models.Variable, as: "variables" },
          { model: models.User, as: "owner" },
        ].filter(Boolean),
      });

      ack && ack({ ok: true, processes });
    } catch (err) {
      console.error("processes:list", err);
      ack && ack({ ok: false, error: "server_error in processes:list" });
    }
  });

  // 🔹 Create Process
  socket.on("processes:create", async (payload, ack) => {
    try {
      audit(socket, "processes:create", payload);
      const id = uuidv4();

      const process = await Process.create({
        id,
        owner_id: socket.user.id,
        ...payload,
      });

      const created = await Process.findByPk(id, {
        include: [{ model: User, as: "owner" }],
      });

      ack && ack({ ok: true, process: created });
      socket.emit("processes:created", created);
      socket.broadcast.emit("processes:created", created);
    } catch (err) {
      console.error("processes:create", err);
      ack && ack({ ok: false, error: "server_error in processes:create" });
    }
  });

  // 🔹 Update Process
  socket.on("processes:update", async (payload, ack) => {
    try {
      audit(socket, "processes:update", payload);
      const { id, ...updates } = payload;
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Process.update(updates, { where: { id } });
      const updated = await Process.findByPk(id, {
        include: [{ model: User, as: "owner" }],
      });

      ack && ack({ ok: true, process: updated });
      socket.emit("processes:updated", updated);
      socket.broadcast.emit("processes:updated", updated);
    } catch (err) {
      console.error("processes:update", err);
      ack && ack({ ok: false, error: "server_error in processes:update" });
    }
  });

  // 🔹 Delete Process
  socket.on("processes:delete", async (id, ack) => {
    try {
      audit(socket, "processes:delete", { id });
      await Process.destroy({ where: { id } });

      ack && ack({ ok: true });
      socket.emit("processes:deleted", { id });
      socket.broadcast.emit("processes:deleted", { id });
    } catch (err) {
      console.error("processes:delete", err);
      ack && ack({ ok: false, error: "server_error in processes:delete" });
    }
  });
};
