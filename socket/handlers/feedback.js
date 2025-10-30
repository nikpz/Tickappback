// server/sockets/handlers/feedback.js
const { audit } = require("../../middleware/audit");
const models = require("../../models"); // ✅ Make sure you have this model

module.exports = function feedbackHandler(socket) {
  // CREATE
  socket.on("feedback:create", async (data) => {
    try {
      const feedback = await models.Feedback.create(data);
      audit(socket, "feedback:create", feedback);

      socket.emit("feedback:created", feedback);
      socket.broadcast.emit("feedback:created", feedback);
    } catch (err) {
      console.error("Error creating feedback:", err);
      socket.emit("feedback:error", { action: "create", error: err.message });
    }
  });

  // UPDATE
  socket.on("feedback:update", async (data) => {
    try {
      await Feedback.update(data, { where: { id: data.id } });
      const updated = await Feedback.findByPk(data.id);
      audit(socket, "feedback:update", updated);

      socket.emit("feedback:updated", updated);
      socket.broadcast.emit("feedback:updated", updated);
    } catch (err) {
      console.error("Error updating feedback:", err);
      socket.emit("feedback:error", { action: "update", error: err.message });
    }
  });

  // DELETE
  socket.on("feedback:delete", async (id) => {
    try {
      await Feedback.destroy({ where: { id } });
      audit(socket, "feedback:delete", { id });

      socket.emit("feedback:deleted", id);
      socket.broadcast.emit("feedback:deleted", id);
    } catch (err) {
      console.error("Error deleting feedback:", err);
      socket.emit("feedback:error", { action: "delete", error: err.message });
    }
  });

  // LIST (optional — helps hydrate the front end)
  socket.on("feedback:list", async (_, callback) => {
    try {
      const list = await Feedback.findAll();
      callback({ ok: true, feedbacks: list });
    } catch (err) {
      callback({ ok: false, error: err.message });
    }
  });
};
