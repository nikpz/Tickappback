const CustomerNeed = require("../../models/CustomerNeed");
const { audit } = require("../../middleware/audit");

module.exports = function customerNeeds(socket) {
  socket.on("customerNeeds:create", async (data) => {
    audit(socket, "customerNeeds:create", data);
    const need = await CustomerNeed.create(data);
    socket.emit("customerNeeds:created", need);
    socket.broadcast.emit("customerNeeds:created", need);
  });

  socket.on("customerNeeds:update", async (data) => {
    audit(socket, "customerNeeds:update", data);
    await CustomerNeed.update(data, { where: { id: data.id } });
    const updated = await CustomerNeed.findByPk(data.id);
    socket.emit("customerNeeds:updated", updated);
    socket.broadcast.emit("customerNeeds:updated", updated);
  });

  socket.on("customerNeeds:delete", async (id) => {
    audit(socket, "customerNeeds:delete", id);
    await CustomerNeed.destroy({ where: { id } });
    socket.emit("customerNeeds:deleted", id);
    socket.broadcast.emit("customerNeeds:deleted", id);
  });
};

