const Strategy = require("../../models/Strategy");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");


module.exports = function strategies(socket) {
  // 🔹 1. Create Strategy
  socket.on("strategies:create", async (payload, ack) => {
    try {
      audit(socket, "strategies:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const {
        name,
        description,
        icon,
        owner_ids,
        category,
        status,
        start_date,
        end_date,
        swot,
      } = payload || {};

      const strategy = await Strategy.create({
        id: uuidv4(),
        name,
        description,
        icon,
        owner_ids: owner_ids || [socket.user.id],
        category,
        status: status || "draft",
        start_date,
        end_date,
        swot,
      });

      ack && ack({ ok: true, strategy });
      socket.emit("strategies:created", strategy);
      socket.broadcast.emit("strategies:created", strategy);
    } catch (err) {
      console.error("strategies:create", err);
      ack && ack({ ok: false, error: "server_error in strategies:create" });
    }
  });

  // 🔹 2. Update Strategy
  socket.on("strategies:update", async (payload, ack) => {
    try {
      audit(socket, "strategies:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Strategy.update(updates, { where: { id } });
      const updated = await Strategy.findByPk(id);

      ack && ack({ ok: true, strategy: updated });
      socket.emit("strategies:updated", updated);
      socket.broadcast.emit("strategies:updated", updated);
    } catch (err) {
      console.error("strategies:update", err);
      ack && ack({ ok: false, error: "server_error in strategies:update" });
    }
  });

  // 🔹 3. List Strategies
  socket.on("strategies:list", async (payload, ack) => {
    try {
      audit(socket, "strategies:list", payload);
      const { status, category } = payload || {};

      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;

      const strategies = await Strategy.findAll({
        where,
        order: [["created_at", "DESC"]],
      });

      ack && ack({ ok: true, strategies });
    } catch (err) {
      console.error("strategies:list", err);
      ack && ack({ ok: false, error: "server_error in strategies:list" });
    }
  });

  // 🔹 4. Get One
  socket.on("strategies:get", async (payload, ack) => {
    try {
      audit(socket, "strategies:get", payload);
      const { id } = payload || {};
      const strategy = await Strategy.findByPk(id);
      ack && ack({ ok: true, strategy });
    } catch (err) {
      console.error("strategies:get", err);
      ack && ack({ ok: false, error: "server_error in strategies:get" });
    }
  });

  // 🔹 5. Delete (soft)
  socket.on("strategies:delete", async (payload, ack) => {
    try {
      audit(socket, "strategies:delete", payload);
      const { id } = payload || {};
      await Strategy.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("strategies:deleted", { id });
      socket.broadcast.emit("strategies:deleted", { id });
    } catch (err) {
      console.error("strategies:delete", err);
      ack && ack({ ok: false, error: "server_error in strategies:delete" });
    }
  });

  // 🔹 6. Destroy (hard delete)
  socket.on("strategies:destroy", async (payload, ack) => {
    try {
      audit(socket, "strategies:destroy", payload);
      const { id } = payload || {};
      await Strategy.destroy({ where: { id }, force: true });
      ack && ack({ ok: true });
      socket.emit("strategies:destroyed", { id });
      socket.broadcast.emit("strategies:destroyed", { id });
    } catch (err) {
      console.error("strategies:destroy", err);
      ack && ack({ ok: false, error: "server_error in strategies:destroy" });
    }
  });

  // 🔹 7. Restore
  socket.on("strategies:restore", async (payload, ack) => {
    try {
      audit(socket, "strategies:restore", payload);
      const { id } = payload || {};
      await Strategy.restore({ where: { id } });
      const restored = await Strategy.findByPk(id);
      ack && ack({ ok: true, strategy: restored });
      socket.emit("strategies:restored", restored);
      socket.broadcast.emit("strategies:restored", restored);
    } catch (err) {
      console.error("strategies:restore", err);
      ack && ack({ ok: false, error: "server_error in strategies:restore" });
    }
  });

  // 🔹 8. Change Status
  socket.on("strategies:change-status", async (payload, ack) => {
    try {
      audit(socket, "strategies:change-status", payload);
      const { id, status } = payload || {};
      await Strategy.update({ status }, { where: { id } });
      const updated = await Strategy.findByPk(id);
      ack && ack({ ok: true, strategy: updated });
      socket.emit("strategies:status-changed", updated);
      socket.broadcast.emit("strategies:status-changed", updated);
    } catch (err) {
      console.error("strategies:change-status", err);
      ack && ack({ ok: false, error: "server_error in strategies:change-status" });
    }
  });

  // 🔹 9. Update Owners
  socket.on("strategies:update-owners", async (payload, ack) => {
    try {
      audit(socket, "strategies:update-owners", payload);
      const { id, owner_ids } = payload || {};
      await Strategy.update({ owner_ids }, { where: { id } });
      const updated = await Strategy.findByPk(id);
      ack && ack({ ok: true, strategy: updated });
      socket.emit("strategies:owners-updated", updated);
      socket.broadcast.emit("strategies:owners-updated", updated);
    } catch (err) {
      console.error("strategies:update-owners", err);
      ack && ack({ ok: false, error: "server_error in strategies:update-owners" });
    }
  });

  // 🔹 10. Update SWOT analysis
  socket.on("strategies:update-swot", async (payload, ack) => {
    try {
      audit(socket, "strategies:update-swot", payload);
      const { id, swot } = payload || {};
      await Strategy.update({ swot }, { where: { id } });
      const updated = await Strategy.findByPk(id);
      ack && ack({ ok: true, strategy: updated });
      socket.emit("strategies:swot-updated", updated);
      socket.broadcast.emit("strategies:swot-updated", updated);
    } catch (err) {
      console.error("strategies:update-swot", err);
      ack && ack({ ok: false, error: "server_error in strategies:update-swot" });
    }
  });

};


/*

// Create or update strategy
  socket.on("strategies:create", async (data) => {
    audit(socket, "strategies:create", data);
    const strategy = await Strategy.create(data);
    socket.emit("strategies:created", strategy);
    socket.broadcast.emit("strategies:created", strategy);
  });

  socket.on("strategies:update", async (data) => {
    audit(socket, "strategies:update", data);
    await Strategy.update(data, { where: { id: data.id } });
    const updated = await Strategy.findByPk(data.id);
    socket.emit("strategies:updated", updated);
    socket.broadcast.emit("strategies:updated", updated);
  });

  // Delete strategy
  socket.on("strategies:delete", async (id) => {
    audit(socket, "strategies:delete", id);
    await Strategy.destroy({ where: { id } });
    socket.emit("strategies:deleted", id);
    socket.broadcast.emit("strategies:deleted", id);
  });

  */