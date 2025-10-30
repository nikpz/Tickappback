const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function keyResults(socket) {
  // 🧠 List all key results
  socket.on("keyResults:list", async (_, ack) => {
    audit(socket, "keyResults:list");
    try {
      const list = await models.KeyResult.findAll({
        include: [
          { model: models.User, as: "owner" },
          { model: models.Objective, as: "objective" },
        ],
        order: [["created_at", "DESC"]],
      });
      ack && ack({ ok: true, keyResults: list });
      socket.emit("keyResults:set", list);
    } catch (err) {
      console.error("keyResults:list", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // ➕ Create a KeyResult
  socket.on("keyResults:create", async (data, ack) => {
    audit(socket, "keyResults:create", data);
    try {
      const id = data.id || `kr-${Date.now()}`;
      const newKR = await models.KeyResult.create({
        id,
        title: data.title,
        category: data.category,
        type: data.type,
        start_value: data.start_value || 0,
        current_value: data.current_value || 0,
        target_value: data.target_value || 100,
        daily_target: data.daily_target,
        stretch_levels: data.stretch_levels,
        binary_labels: data.binary_labels,
        assigned_task_ids: data.assigned_task_ids || [],
        owner_id: data.owner_id || socket.user.id,
        objective_id: data.objective_id || null,
      });

      const full = await models.KeyResult.findByPk(id, {
        include: [
          { model: models.User, as: "owner", attributes: ["id", "name"] },
          { model: models.Objective, as: "objective", attributes: ["id", "title"] },
        ],
      });
      socket.emit("keyResults:created", full);
      socket.broadcast.emit("keyResults:created", full);
      ack && ack({ ok: true, keyResult: full });
    } catch (err) {
      console.error("keyResults:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // ✏️ Update KeyResult
  socket.on("keyResults:update", async (data, ack) => {
    audit(socket, "keyResults:update", data);
    try {
      const kr = await models.KeyResult.findByPk(data.id);
      if (!kr) return ack && ack({ ok: false, error: "not_found" });

      await kr.update(data);
      await kr.update(data);

      const full = await models.KeyResult.findByPk(data.id, {
        include: [
          { model: models.User, as: "owner", attributes: ["id", "name"] },
          { model: models.Objective, as: "objective", attributes: ["id", "title"] },
        ],
      });
      socket.emit("keyResults:updated", full);
      socket.broadcast.emit("keyResults:updated", full);
      ack && ack({ ok: true, keyResult: full });
    } catch (err) {
      console.error("keyResults:update", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // ❌ Delete
  socket.on("keyResults:delete", async ({ id }, ack) => {
    audit(socket, "keyResults:delete", { id });
    try {
      await models.KeyResult.destroy({ where: { id } });
      socket.emit("keyResults:deleted", { id });
      socket.broadcast.emit("keyResults:deleted", { id });
      ack && ack({ ok: true });
    } catch (err) {
      console.error("keyResults:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};
