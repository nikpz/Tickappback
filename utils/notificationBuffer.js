const buffers = new Map(); // user_id -> [notifications]
const FLUSH_INTERVAL = 10000; // 10 seconds

module.exports.addToBuffer = function (user_id, notificationData) {
  if (!buffers.has(user_id)) buffers.set(user_id, []);
  buffers.get(user_id).push(notificationData);
};

module.exports.startFlusher = function (io, models) {
  setInterval(async () => {
    for (const [user_id, notifs] of buffers.entries()) {
      if (notifs.length === 0) continue;

      const groupedByType = notifs.reduce((acc, n) => {
        acc[n.type] = acc[n.type] || [];
        acc[n.type].push(n);
        return acc;
      }, {});

      for (const [type, list] of Object.entries(groupedByType)) {
        const count = list.length;
        const first = list[0];
        const message =
          count === 1
            ? first.message
            : `🔔 You have ${count} new ${type} notifications`;

        const notification = await models.Notification.create({
          id: require("uuid").v4(),
          user_id,
          type,
          item_id: null,
          message,
        });

        io.to(user_id).emit("notifications:new", notification);
      }

      buffers.set(user_id, []); // clear
    }
  }, FLUSH_INTERVAL);
};
// This flusher groups notifications for each user by type every 10 seconds.

