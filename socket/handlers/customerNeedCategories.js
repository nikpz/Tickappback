const CustomerNeedCategory = require("../../models/CustomerNeedCategory");
const { audit } = require("../../middleware/audit");

module.exports = function customerNeedCategories(socket) {
  socket.on("customerNeedCategories:create", async (data) => {
    audit(socket, "customerNeedCategories:create", data);
    const category = await CustomerNeedCategory.create(data);
    socket.emit("customerNeedCategories:created", category);
    socket.broadcast.emit("customerNeedCategories:created", category);
  });

  socket.on("customerNeedCategories:update", async (data) => {
    audit(socket, "customerNeedCategories:update", data);
    await CustomerNeedCategory.update(data, { where: { id: data.id } });
    const updated = await CustomerNeedCategory.findByPk(data.id);
    socket.emit("customerNeedCategories:updated", updated);
    socket.broadcast.emit("customerNeedCategories:updated", updated);
  });

  socket.on("customerNeedCategories:delete", async (id) => {
    audit(socket, "customerNeedCategories:delete", data);
    await CustomerNeedCategory.destroy({ where: { id } });
    socket.emit("customerNeedCategories:deleted", id);
    socket.broadcast.emit("customerNeedCategories:deleted", id);
  });
};
