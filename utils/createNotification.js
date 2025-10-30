//You’ll use this in multiple handlers (so put it in /utils/createNotification.js):
const { v4: uuidv4 } = require("uuid");
const { addToBuffer } = require("./notificationBuffer");

module.exports = async function createNotification(io, models, {
  user_id,
  type = "system",
  item_id = null,
  message,
}) {
  try {
    //Now every call like:
        /*
        await createNotification(io, models, {
            user_id: task.assignee_id,
            type: "task",
            message: `📝 You were assigned "${task.title}"`,
        });
        */
    //just adds it to the buffer, not the DB immediately.
    addToBuffer(user_id, data);

    const notification = await models.Notification.create({
      id: uuidv4(),
      user_id,
      type,
      item_id,
      message,
    });

    // Re-fetch with relations for consistency
    const full = await models.Notification.findByPk(notification.id, {
      include: [{ model: models.User, as: "user" }],
    });

    // Emit to that user only (if connected)
    io.to(user_id).emit("notifications:new", full);

    return full;
  } catch (err) {
    console.error("createNotification", err);
  }
};
// 💡 You can also wrap it in try/catch inside socket handlers to avoid propagation of notification errors.

