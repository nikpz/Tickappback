const MicroLearning = require("../../models/microLearning");
const { audit } = require("../../middleware/audit");

module.exports = function microLearnings(socket) {
    socket.on("microLearnings:create", async (data) => {
      audit(socket, "microLearnings:create", data);
      // Placeholder — implement MicroLearning model
      socket.emit("microLearnings:created", data);
      socket.broadcast.emit("microLearnings:created", data);
    });
};

