const models = require("../../models");
const { Document } = models;
const { audit } = require("../../middleware/audit");

module.exports = function documents(socket) {
  // 🔹 Update a document
  socket.on("documents:update", async (data, ack) => {
    try {
      audit(socket, "documents:update", data);

      await Document.update(data, { where: { id: data.id } });
      const updated = await Document.findByPk(data.id);

      // Send confirmation to sender
      ack && ack({ ok: true, document: updated });

      // Notify everyone (sender + others)
      socket.emit("documents:updated", updated);
      socket.broadcast.emit("documents:updated", updated);
    } catch (err) {
      console.error("documents:update", err);
      ack && ack({ ok: false, error: "server_error in documents:update" });
    }
  });
  // 🔹 Set / Replace full document list
  socket.on("documents:set", (docs, ack) => {
    try {
      audit(socket, "documents:set", docs);

      // Send confirmation to sender
      ack && ack({ ok: true });

      // Notify everyone (sender + others)
      socket.emit("documents:set", docs);
      socket.broadcast.emit("documents:set", docs);
    } catch (err) {
      console.error("documents:set", err);
      ack && ack({ ok: false, error: "server_error in documents:set" });
    }
  });

  socket.on("documents:create", async (payload, ack) => {
    try {
      audit(socket, "documents:create", payload);

      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { title, content, status, project_id, owner_id } = payload || {};

      const document = await Document.create({
        id: uuidv4(),
        title,
        content,
        status,
        project_id,
        owner_id,
      });

      ack && ack({ ok: true, document });
      socket.emit("documents:created", document);
      socket.broadcast.emit("documents:created", document);
    } catch (err) {
      console.error("documents:create", err);
      ack && ack({ ok: false, error: "server_error in documents:create" });
    }
  });

  socket.on("documents:delete", async ({ id }, ack) => {
    try {
      audit(socket, "documents:delete", { id });
      await Document.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("documents:deleted", { id });
      socket.broadcast.emit("documents:deleted", { id });
    } catch (err) {
      console.error("documents:delete", err);
      ack && ack({ ok: false, error: "server_error in documents:delete" });
    }
  });
};

/*
  // Create
  socket.on("documents:create", async (payload, ack) => {
    const doc = await Document.create(payload);
    ack && ack({ ok: true, document: doc });
    socket.emit("documents:created", doc);
    socket.broadcast.emit("documents:created", doc);
  });

    // Delete
  socket.on("documents:delete", async ({ id }, ack) => {
    await Document.destroy({ where: { id } });
    ack && ack({ ok: true });
    socket.emit("documents:deleted", { id });
    socket.broadcast.emit("documents:deleted", { id });
  });

  */
