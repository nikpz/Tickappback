const Index = require("../../models/Index");
const { audit } = require("../../middleware/audit");

module.exports = function indices(socket) {
  // Create or update index
  socket.on("indices:create", async (data) => {
    audit(socket, "indices:create", data);
    const index = await Index.create(data);
    socket.emit("indices:created", index);
    socket.broadcast.emit("indices:created", index);
  });

  socket.on("indices:update", async (data) => {
    audit(socket, "indices:update", data);
    await Index.update(data, { where: { id: data.id } });
    const updated = await Index.findByPk(data.id);
    socket.emit("indices:updated", updated);
    socket.broadcast.emit("indices:updated", updated);
  });

  // Delete index
  socket.on("indices:delete", async (id) => {
    audit(socket, "indices:delete", id);
    await Index.destroy({ where: { id } });
    socket.emit("indices:deleted", id);
    socket.broadcast.emit("indices:deleted", id);
  });
};

