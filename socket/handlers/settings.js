// server/socketHandlers/settings.js
const { audit } = require("../../middleware/audit");
const { models } = require("../../models");

module.exports = function settingsHandlers(socket) {
    const { User } = models;

    socket.on("settings:update", async (payload, ack) => {
    try {
      audit(socket, "settings:update", payload);
      if (!socket.user) return ack({ ok: false, error: "unauthorized" });

      const { key, value } = payload;
      // Optionally store in DB (e.g. user_preferences table)
      await models.User.update(
        { preferences: { [key]: value } },
        { where: { id: socket.user.id } }
      );
      const user = await models.User.findByPk(socket.user.id);

      // 🧠 Merge old + new preferences
      const newPrefs = {
        ...(user.preferences || {}),
        [key]: value,
      };
      // 💾 Save to DB
      user.preferences = newPrefs;
      await user.save();
      // Broadcast updated setting (optional)
      socket.emit("settings:updated", { key, value });
      socket.broadcast.emit("settings:updated", { key, value });

      // ✅ Confirm success to client
      ack && ack({ ok: true, preferences: newPrefs });
    } catch (err) {
      console.error("settings:update error:", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};
