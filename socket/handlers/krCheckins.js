const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function krCheckins(socket) {
  // 📋 List Checkins for a KeyResult
  socket.on("krCheckins:list", async ({ kr_id }, ack) => {
    audit(socket, "krCheckins:list", { kr_id });
    try {
      const list = await models.KRCheckin.findAll({
        where: { kr_id },
        include: [
          { model: models.User, as: "user" },
          { model: models.KeyResult, as: "keyResult" },
        ],
        order: [["created_at", "DESC"]],
      });
      ack && ack({ ok: true, checkins: list });
      socket.emit("krCheckins:set", list);
    } catch (err) {
      console.error("krCheckins:list", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🧠 UPDATE check-in
  socket.on("krCheckins:update", async (data, ack) => {
    audit(socket, "krCheckins:update", data);
    try {
      const existing = await models.KRCheckin.findByPk(data.id);
      if (!existing) return ack && ack({ ok: false, error: "not_found" });

      await existing.update(data);
      const full = await models.KRCheckin.findByPk(data.id, {
        include: [
          { model: models.User, as: "user" },
          { model: models.KeyResult, as: "keyResult" },
        ],
      });

      socket.emit("krCheckins:updated", full);
      socket.broadcast.emit("krCheckins:updated", full);
      ack && ack({ ok: true, checkin: full });
    } catch (err) {
      console.error("krCheckins:update", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🧠 DELETE check-in
  socket.on("krCheckins:delete", async (id, ack) => {
    audit(socket, "krCheckins:delete", { id });
    try {
      await models.KRCheckin.destroy({ where: { id } });
      socket.emit("krCheckins:deleted", id);
      socket.broadcast.emit("krCheckins:deleted", id);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("krCheckins:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // ➕ Create Checkin
  socket.on("krCheckins:create", async (data, ack) => {
    audit(socket, "krCheckins:create", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const id = data.id || `krc-${Date.now()}`;
      const checkin = await models.KRCheckin.create({
        id,
        kr_id: data.kr_id,
        value: data.value,
        rating: data.rating || null,
        user_id: data.user_id || socket.user.id,
        feedback_giver_id: data.feedback_giver_id,
        feedback_tag_id: data.feedback_tag_id,
        report: data.report || {},
      });
      const full = await models.KRCheckin.findByPk(id, {
        include: [
          { model: models.User, as: "user" },
          { model: models.KeyResult, as: "keyResult" },
        ],
      });

      socket.emit("krCheckins:created", full);
      socket.broadcast.emit("krCheckins:created", full);
      ack && ack({ ok: true, checkin });
    } catch (err) {
      console.error("krCheckins:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};
