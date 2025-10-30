const models = require("../../models");
const { audit } = require("../../middleware/audit");
const createNotification = require("../utils/createNotification");

module.exports = function generalFeedbacks(socket) {
  socket.on("generalFeedbacks:create", async (data, ack) => {
    audit(socket, "generalFeedbacks:create", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    try {
      const id = data.id || `fb-${Date.now()}`;
      const feedback = await models.GeneralFeedback.create({
        id,
        giver_id: socket.user.id,
        receiver_id: data.receiver_id || null,
        text: data.text,
        tags: data.tags || [],
      });

      const full = await models.GeneralFeedback.findByPk(id, {
        include: [{ model: models.User, as: "giver" }],
      });

      socket.emit("generalFeedbacks:created", full);
      socket.broadcast.emit("generalFeedbacks:created", full);

      // ✅ Create notification for the receiver
      if (feedback.receiver_id) {
        await createNotification(io, models, {
          user_id: feedback.receiver_id,
          type: "feedback",
          item_id: feedback.id,
          message: `📨 You received feedback from ${socket.user.name}`,
        });
      }
      ack && ack({ ok: true, feedback: full });
    } catch (err) {
      console.error("generalFeedbacks:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  //When Feedback is given
  // ✏️ Update feedback
  socket.on("feedback:update", async (data, ack) => {
    audit(socket, "feedback:update", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const feedback = await models.GeneralFeedback.findByPk(data.id);
      if (!feedback) return ack && ack({ ok: false, error: "not_found" });

      await feedback.update({
        text: data.text ?? feedback.text,
        tags: data.tags ?? feedback.tags,
      });

      const updated = await models.GeneralFeedback.findByPk(data.id, {
        include: [{ model: models.User, as: "giver" }],
      });

      socket.emit("feedback:updated", updated);
      socket.broadcast.emit("feedback:updated", updated);

      ack && ack({ ok: true, feedback: updated });
    } catch (err) {
      console.error("feedback:update", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // ❌ Delete feedback
  socket.on("feedback:delete", async ({ id }, ack) => {
    audit(socket, "feedback:delete", { id });
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const feedback = await models.GeneralFeedback.findByPk(id);
      if (!feedback) return ack && ack({ ok: false, error: "not_found" });

      await feedback.destroy();

      socket.emit("feedback:deleted", id);
      socket.broadcast.emit("feedback:deleted", id);

      ack && ack({ ok: true });
    } catch (err) {
      console.error("feedback:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🔄 List feedback (initial sync)
  socket.on("feedback:list", async (data, ack) => {
    audit(socket, "feedback:list", {});
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const feedbacks = await models.GeneralFeedback.findAll({
        include: [{ model: models.User, as: "giver" }],
        order: [["created_at", "DESC"]],
      });

      ack && ack({ ok: true, feedbacks });
    } catch (err) {
      console.error("feedback:list", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};

/*
socket.on("generalFeedbacks:create", async (data) => {
    audit(socket, "generalFeedbacks:create", data);
    const feedback = await GeneralFeedback.create(data);
    socket.emit("generalFeedbacks:created", feedback);
    socket.broadcast.emit("generalFeedbacks:created", feedback);
  });
*/
