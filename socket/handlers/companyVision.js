const CompanyVision = require("../../models/CompanyVision");
const { audit } = require("../../middleware/audit");

module.exports = function companyVision(socket) {
  socket.on("companyVision:update", async (data) => {
    audit(socket, "companyVision:update", data);
    await CompanyVision.update(data, { where: { id: data.id } });
    const updated = await CompanyVision.findByPk(data.id);
    socket.emit("companyVision:updated", updated);
    socket.broadcast.emit("companyVision:updated", updated);
  });
};