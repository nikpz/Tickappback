const models = require("../../models");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function workspacesMember(socket) {
  const { Workspace, WorkspaceMember, User } = models;

  // 🔹 1. Invite / add user to workspace
  socket.on("workspaces:invite-user", async (payload, ack) => {
    try {
      audit(socket, "workspaces:invite-user", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { workspace_id, user_id, role } = payload || {};
      if (!workspace_id || !user_id)
        return ack && ack({ ok: false, error: "missing_fields" });

      const workspace = await Workspace.findByPk(workspace_id);
      if (!workspace)
        return ack && ack({ ok: false, error: "workspace_not_found" });

      const existing = await WorkspaceMember.findOne({
        where: { workspace_id, user_id },
      });
      if (existing) return ack && ack({ ok: false, error: "already_member" });

      const member = await WorkspaceMember.create({
        id: uuidv4(),
        workspace_id,
        user_id,
        role: role || "member",
      });

      const full = await WorkspaceMember.findByPk(member.id, {
        include: [{ model: User, as: "user" }],
      });

      ack && ack({ ok: true, member: full });
      socket.emit("workspaces:user-invited", full);
      socket.broadcast.emit("workspaces:user-invited", full);
    } catch (err) {
      console.error("workspaces:invite-user", err);
      ack &&
        ack({ ok: false, error: "server_error in workspaces:invite-user" });
    }
  });

  // 🔹 2. Remove user from workspace
  socket.on("workspaces:remove-user", async (payload, ack) => {
    try {
      audit(socket, "workspaces:remove-user", payload);
      const { workspace_id, user_id } = payload || {};
      if (!workspace_id || !user_id)
        return ack && ack({ ok: false, error: "missing_fields" });

      await WorkspaceMember.destroy({ where: { workspace_id, user_id } });

      ack && ack({ ok: true });
      socket.emit("workspaces:user-removed", { workspace_id, user_id });
      socket.broadcast.emit("workspaces:user-removed", {
        workspace_id,
        user_id,
      });
    } catch (err) {
      console.error("workspaces:remove-user", err);
      ack &&
        ack({ ok: false, error: "server_error in workspaces:remove-user" });
    }
  });

  // 🔹 3. Update member role
  socket.on("workspaces:update-role", async (payload, ack) => {
    try {
      audit(socket, "workspaces:update-role", payload);
      const { workspace_id, user_id, role } = payload || {};
      await WorkspaceMember.update(
        { role },
        { where: { workspace_id, user_id } }
      );
      const updated = await WorkspaceMember.findOne({
        where: { workspace_id, user_id },
        include: [{ model: User, as: "user" }],
      });
      ack && ack({ ok: true, member: updated });
      socket.emit("workspaces:role-updated", updated);
      socket.broadcast.emit("workspaces:role-updated", updated);
    } catch (err) {
      console.error("workspaces:update-role", err);
      ack &&
        ack({ ok: false, error: "server_error in workspaces:update-role" });
    }
  });

  // 🔹 4. List workspace members
  socket.on("workspaces:list-members", async (payload, ack) => {
    try {
      audit(socket, "workspaces:list-members", payload);
      const { workspace_id } = payload || {};
      const members = await WorkspaceMember.findAll({
        where: { workspace_id },
        include: [{ model: User, as: "user" }],
        order: [["created_at", "ASC"]],
      });
      ack && ack({ ok: true, members });
    } catch (err) {
      console.error("workspaces:list-members", err);
      ack &&
        ack({ ok: false, error: "server_error in workspaces:list-members" });
    }
  });
};


//A user might be added to a project that lives in workspace “Hotel”
//…but not actually be a member of workspace “Hotel”
//→ which breaks authorization (they’d see the project but not the workspace)
//whenever someone joins a project, if they’re not already a workspace member, they’ll be added automatically as a viewer.
