const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function krCategories(socket) {
  // 🧠 CREATE
  socket.on("krCategories:create", async (data, ack) => {
    audit(socket, "krCategories:create", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const id = data.id || `krcat-${Date.now()}`;
      const category = await models.KRCategory.create({
        id,
        name: data.name,
        description: data.description || null,
      });

      socket.emit("krCategories:created", category);
      socket.broadcast.emit("krCategories:created", category);
      ack && ack({ ok: true, category });
    } catch (err) {
      console.error("krCategories:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🧠 UPDATE
  socket.on("krCategories:update", async (data, ack) => {
    audit(socket, "krCategories:update", data);
    try {
      const category = await models.KRCategory.findByPk(data.id);
      if (!category) return ack && ack({ ok: false, error: "not_found" });

      await category.update(data);
      socket.emit("krCategories:updated", category);
      socket.broadcast.emit("krCategories:updated", category);
      ack && ack({ ok: true, category });
    } catch (err) {
      console.error("krCategories:update", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🧠 DELETE
  socket.on("krCategories:delete", async (id, ack) => {
    audit(socket, "krCategories:delete", { id });
    try {
      await models.KRCategory.destroy({ where: { id } });
      socket.emit("krCategories:deleted", id);
      socket.broadcast.emit("krCategories:deleted", id);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("krCategories:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  socket.on("krCategories:list", async (_, ack) => {
    audit(socket, "krCategories:list", {});
    try {
      const list = await models.KRCategory.findAll({
        order: [["created_at", "DESC"]],
        //order: [["name", "ASC"]],
      });
      ack && ack({ ok: true, categories: list });
      socket.emit("krCategories:set", list);
    } catch (err) {
      console.error("krCategories:list", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};
