const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function feedbackTags(socket) {
  socket.on("feedbackTags:create", async (tag, ack) => {
    audit(socket, "feedbackTags:create", tag);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      // const created = await models.FeedbackTag.create(tag);
      const created = await models.FeedbackTag.create({
        name: data.name,
        color: data.color || "#888888",
      });
      socket.emit("feedbackTags:created", created);
      socket.broadcast.emit("feedbackTags:created", created);
      ack && ack({ ok: true, tag: created });
    } catch (err) {
      console.error("feedbackTags:create", err);
      ack && ack({ ok: false });
    }
  });

  socket.on("feedbackTags:update", async (tag, ack) => {
    audit(socket, "feedbackTags:update", tag);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const updated = await models.FeedbackTag.findByPk(tag.id);
      if (!tag) return ack && ack({ ok: false, error: "not_found" });
      // await models.FeedbackTag.update(tag, { where: { id: tag.id } });
      await models.FeedbackTag.update(
        {
          name: data.name ?? tag.name,
          color: data.color ?? tag.color,
        },
        { where: { id: tag.id } }
      );

      socket.emit("feedbackTags:updated", updated);
      socket.broadcast.emit("feedbackTags:updated", updated);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("feedbackTags:update", err);
      ack && ack({ ok: false });
    }
  });

  socket.on("feedbackTags:delete", async (id, ack) => {
    audit(socket, "feedbackTags:delete", id);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      await models.FeedbackTag.destroy({ where: { id } });
      // socket.emit("feedbackTags:deleted", id);
      // socket.broadcast.emit("feedbackTags:deleted", id);
      const updated = await models.FeedbackTag.findAll();
      socket.emit("feedbackTags:deleted", updated);
      socket.broadcast.emit("feedbackTags:deleted", updated);
      // await FeedbackTag.destroy({ where: { id } });
      // socket.emit("feedbackTags:deleted", id);
      // socket.broadcast.emit("feedbackTags:deleted", id);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("feedbackTags:delete", err);
      ack && ack({ ok: false });
    }
  });

  // LIST (for hydration)
  socket.on("feedbackTags:list", async (_, ack) => {
    audit(socket, "feedbackTags:list", {});
    try {
      const tags = await FeedbackTag.findAll({
        order: [["created_at", "DESC"]],
      });
      ack({ ok: true, tags });
      socket.emit("feedbackTags:set", tags);
    } catch (err) {
      console.error("feedbackTags:list", err);
      ack({ ok: false, error: err.message });
    }
  });
};

/*
socket.on("feedbackTags:create", async (data) => {
    audit(socket, "feedbackTags:create", data);
    const tag = await FeedbackTag.create(data);
    socket.emit("feedbackTags:created", tag);
    socket.broadcast.emit("feedbackTags:created", tag);
  });

  socket.on("feedbackTags:update", async (data) => {
    audit(socket, "feedbackTags:update", data);
    await FeedbackTag.update(data, { where: { id: data.id } });
    const updated = await FeedbackTag.findByPk(data.id);
    socket.emit("feedbackTags:updated", updated);
    socket.broadcast.emit("feedbackTags:updated", updated);
  });

  socket.on("feedbackTags:delete", async (id) => {
    audit(socket, "feedbackTags:delete", id);
    await FeedbackTag.destroy({ where: { id } });
    socket.emit("feedbackTags:deleted", id);
    socket.broadcast.emit("feedbackTags:deleted", id);
  });

*/
