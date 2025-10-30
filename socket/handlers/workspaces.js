// Following the same style as your other handlers (forms, boards, etc.):
const models = require("../../models");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function workspaces(socket) {
  const { Workspace, Project, Board, User } = models;

  // 🔹 1. Create Workspace
  socket.on("workspaces:create", async (payload, ack) => {
    try {
      audit(socket, "workspaces:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { name, description, color, icon, settings } = payload || {};
      const workspace = await Workspace.create({
        id: uuidv4(),
        name,
        description,
        color,
        icon,
        owner_id: socket.user.id,
        settings,
      });

      const full = await Workspace.findByPk(workspace.id, {
        include: [{ model: User, as: "owner" }],
      });

      ack && ack({ ok: true, workspace: full });
      socket.emit("workspaces:created", full);
      socket.broadcast.emit("workspaces:created", full);
    } catch (err) {
      console.error("workspaces:create", err);
      ack && ack({ ok: false, error: "server_error in workspaces:create" });
    }
  });

  // 🔹 2. Update Workspace
  socket.on("workspaces:update", async (payload, ack) => {
    try {
      audit(socket, "workspaces:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Workspace.update(updates, { where: { id } });
      const updated = await Workspace.findByPk(id, {
        include: [{ model: User, as: "owner" }],
      });

      ack && ack({ ok: true, workspace: updated });
      socket.emit("workspaces:updated", updated);
      socket.broadcast.emit("workspaces:updated", updated);
    } catch (err) {
      console.error("workspaces:update", err);
      ack && ack({ ok: false, error: "server_error in workspaces:update" });
    }
  });

  // 🔹 3. List Workspaces
  socket.on("workspaces:list", async (_payload, ack) => {
    try {
      audit(socket, "workspaces:list", _payload);
      const workspaces = await Workspace.findAll({
        order: [["created_at", "ASC"]],
        include: [{ model: User, as: "owner" }],
      });
      ack && ack({ ok: true, workspaces });
    } catch (err) {
      console.error("workspaces:list", err);
      ack && ack({ ok: false, error: "server_error in workspaces:list" });
    }
  });

  // 🔹 4. Get one Workspace
  socket.on("workspaces:get", async (payload, ack) => {
    try {
      audit(socket, "workspaces:get", payload);
      const { id } = payload || {};
      const workspace = await Workspace.findByPk(id, {
        include: [
          { model: Project, as: "projects" },
          { model: Board, as: "boards" },
        ],
      });
      ack && ack({ ok: true, workspace });
    } catch (err) {
      console.error("workspaces:get", err);
      ack && ack({ ok: false, error: "server_error in workspaces:get" });
    }
  });

  // 🔹 5. Delete (soft)
  socket.on("workspaces:delete", async (payload, ack) => {
    try {
      audit(socket, "workspaces:delete", payload);
      const { id } = payload || {};
      await Workspace.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("workspaces:deleted", { id });
      socket.broadcast.emit("workspaces:deleted", { id });
    } catch (err) {
      console.error("workspaces:delete", err);
      ack && ack({ ok: false, error: "server_error in workspaces:delete" });
    }
  });

  // 🔹 6. Restore
  socket.on("workspaces:restore", async (payload, ack) => {
    try {
      audit(socket, "workspaces:restore", payload);
      const { id } = payload || {};
      await Workspace.restore({ where: { id } });
      const restored = await Workspace.findByPk(id);
      ack && ack({ ok: true, workspace: restored });
      socket.emit("workspaces:restored", restored);
      socket.broadcast.emit("workspaces:restored", restored);
    } catch (err) {
      console.error("workspaces:restore", err);
      ack && ack({ ok: false, error: "server_error in workspaces:restore" });
    }
  });

};

/*
socket.on("workspaces:create", async (data) => {
  audit(socket, "workspaces:create", data);
  const workspace = await Workspace.create(data);
  socket.emit("workspaces:created", workspace);
  socket.broadcast.emit("workspaces:created", workspace);
});
*/