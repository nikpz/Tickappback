const models = require("../models");
const { audit } = require("../../middleware/audit");
const createNotification = require("../../utils/createNotification");
const Task = models.Task;

module.exports = function tasks(socket, io) {
  /**✅ Matches taskService.ts. */
  socket.on("listTasks", async (_, ack) => {
    try {
      const tasks = await Task.findAll({
        include: [
          {
            model: models.User,
            as: "assignee",
            attributes: ["id", "username"],
          },
          {
            model: models.KanbanColumn,
            as: "column",
            attributes: ["id", "title", "color"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      ack && ack({ ok: true, tasks });
    } catch (err) {
      console.error("listTasks", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
  /*
    {
      "id": "t1",
      "content": "Fix login bug",
      "assignee": { "id": "u1", "username": "Ali" },
      "column": { "id": "col1", "title": "In Progress", "color": "blue" }
    }
  */
  // socket.on('createTask', async (payload, ack) => {
  socket.on("tasks:create", async (payload, ack) => {
    audit(socket, "tasks:create", payload);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    try {
      const task = await Task.create(payload);
      ack && ack({ ok: true, task });
      // io.emit('taskCreated', task);
      socket.emit("tasks:created", task);
      socket.broadcast.emit("tasks:created", task);
      //When a new task is assigned
      if (task.assignee_id && task.assignee_id !== socket.user.id) {
        await createNotification(io, models, {
          user_id: task.assignee_id,
          type: "task",
          item_id: task.id,
          message: `📝 You were assigned a new task: "${task.title}"`,
        });
      }
    } catch (err) {
      console.error("tasks:create", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  socket.on("tasks:update", async (payload, ack) => {
    audit(socket, "tasks:update", payload);
    if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    try {
      const { taskId, fields } = payload || {};
      const task = await Task.findByPk(taskId);
      // const task = await Task.findByPk(payload.id);
      if (!task) return ack && ack({ ok: false, error: "not_found" });
      await task.update(fields);
      // await Task.update(payload, { where: { id: payload.id } });
      ack && ack({ ok: true, task });
      // io.emit('taskUpdated', task);
      socket.emit("tasks:updated", task);
      socket.broadcast.emit("tasks:updated", task);
    } catch (err) {
      console.error("tasks:update", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // Delete one or multiple tasks !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  socket.on("tasks:delete", async (taskIds, ack) => {
    audit(socket, "tasks:delete", taskIds);
    try {
      await Task.destroy({ where: { id: taskIds } });
      socket.emit("tasks:deleted", taskIds);
      socket.broadcast.emit("tasks:deleted", taskIds);
      ack && ack({ ok: true });
    } catch (err) {
      console.error("tasks:delete", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });

  // Toggle daily target for a key result  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  socket.on("tasks:toggle-daily-target", async ({ krId, date }) => {
    audit(socket, "tasks:toggle-daily-target", { krId, date });
    // Placeholder logic — implement your DailyTarget model
    const target = { krId, date, toggled: true };
    socket.emit("tasks:updated", target);
    socket.broadcast.emit("tasks:updated", target);
  });
};

/*

// Create a new task
  socket.on("tasks:create", async (data) => {
    audit(socket, "tasks:create", data);
    const task = await Task.create(data);
    socket.emit("tasks:created", task);
    socket.broadcast.emit("tasks:created", task);
  });


  socket.on("tasks:update", async (updatedTask) => {
    audit(socket, "tasks:update", updatedTask);
    await Task.update(updatedTask, { where: { id: updatedTask.id } });
    const task = await Task.findByPk(updatedTask.id);
    socket.emit("tasks:updated", task);
    socket.broadcast.emit("tasks:updated", task);
  });
  */
