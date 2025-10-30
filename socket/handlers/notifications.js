const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function notifications(socket, io) {
  const Notification = models.Notification;

  // 🔹 Fetch all notifications for current user
  socket.on("notifications:list", async (_, ack) => {
    audit(socket, "notifications:list", {});
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const notifications = await Notification.findAll({
        where: { user_id: socket.user.id },
        order: [["created_at", "DESC"]],
      });

      // Emit full list to the client
      socket.emit("notifications:set", notifications);
      ack && ack({ ok: true, notifications });
    } catch (err) {
      console.error("notifications:list", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🔹 Create a new notification
  socket.on("notifications:create", async (data, ack) => {
    audit(socket, "notifications:create", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const notification = await Notification.create({
        id: `notif-${Date.now()}`,
        user_id: data.user_id,
        type: data.type,
        item_id: data.item_id || null,
        message: data.message,
        is_read: false,
      });

      // Emit to target user
      io.to(data.user_id).emit("notifications:created", notification);
      ack && ack({ ok: true, message: "Notification created", notification });
    } catch (err) {
      console.error("notifications:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🔹 Mark notifications as read
  socket.on("notifications:mark-read", async (data, ack) => {
    audit(socket, "notifications:mark-read", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const { notificationId } = data;

      if (notificationId === "all") {
        await Notification.update(
          { is_read: true },
          { where: { user_id: socket.user.id } }
        );
      } else {
        await Notification.update(
          { is_read: true },
          { where: { id: notificationId, user_id: socket.user.id } }
        );
      }

      // Fetch updated notifications for user
      const updated = await Notification.findAll({
        where: { user_id: socket.user.id },
        order: [["created_at", "DESC"]],
      });

      socket.emit("notifications:updated", updated);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("notifications:mark-read", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // 🔹 Optional: delete notification
  socket.on("notifications:delete", async ({ id }, ack) => {
    audit(socket, "notifications:delete", { id });
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

    try {
      const notif = await Notification.findByPk(id);
      if (!notif) return ack && ack({ ok: false, error: "not_found" });

      await notif.destroy();
      socket.emit("notifications:deleted", id);
      ack && ack({ ok: true, message: "Notification deleted" });
    } catch (err) {
      console.error("notifications:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};

/*const models = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function notifications(socket) {
  socket.on("notifications:mark-read", async (data, ack) => {
    audit(socket, "notifications:mark-read", data);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    try {
      const { notificationId, userId } = data;
      if (notificationId === "all") {
        await models.Notification.update(
          { is_read: true },
          { where: { user_id: userId } }
        );
      } else {
        await models.Notification.update(
          { is_read: true },
          { where: { id: notificationId, user_id: userId } }
        );
      }
  
      const updated = await models.Notification.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
      });
      socket.emit("notifications:updated", updated);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("notifications:mark-read", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
};

*/

/*
    socket.on("notifications:mark-read", async (ids) => {
      audit(socket, "notifications:mark-read", ids);
      // Placeholder — implement Notification model
      //////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      socket.emit("notifications:updated", ids);
      socket.broadcast.emit("notifications:updated", ids);
    });

*/

/*
Frontend integration (you already have partial)
You already emit notifications:mark-read,

so add a socket listener:

useEffect(() => {
  socket.on("notifications:new", (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    showToast(`🔔 ${notif.message}`);
  });

  return () => {
    socket.off("notifications:new");
  };
}, []);

*/

/*

Trigger                    Notification Message                 Type               Receiver

Feedback submitted        “You received feedback from X”        feedback          feedback.receiver_id

Project invitation        “You were added to project X”         project           invited user

Task assignment           “You were assigned a new task”        task              assignee

Form submission           “Form X was submitted successfully”   form              submitting user

Mention (optional later)  “X mentioned you in a comment”        mention           mentioned user


To queue and batch notifications (so users get a single digest if multiple events happen quickly, 
like 10 tasks assigned at once)? This is common in real-time SaaS like ClickUp, Notion, or Jira.
*/

/*

socket.on("notifications:new", notif => { ... })
Now it just receives fewer, smarter messages.

Optionally, you can show "summary" type notifications with a 📦 icon.
*/
