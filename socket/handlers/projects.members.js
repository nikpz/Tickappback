// This mirrors your WorkspaceMember logic:
const models = require("../../models");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function projectsMember(socket) {
  const { Project, ProjectMember, User } = models;

  // 🔹 1. Invite user to project
  socket.on("projects:invite-user", async (payload, ack) => {
    try {
      audit(socket, "projects:invite-user", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { project_id, user_id, role } = payload || {};
      if (!project_id || !user_id)
        return ack && ack({ ok: false, error: "missing_fields" });

      const project = await Project.findByPk(project_id);
      if (!project) return ack && ack({ ok: false, error: "project_not_found" });

      const existing = await ProjectMember.findOne({
        where: { project_id, user_id },
      });
      if (existing) return ack && ack({ ok: false, error: "already_member" });

      const member = await ProjectMember.create({
        id: uuidv4(),
        project_id,
        user_id,
        role: role || "member",
      });

      const full = await ProjectMember.findByPk(member.id, {
        include: [{ model: User, as: "user" }],
      });

      ack && ack({ ok: true, member: full });
      socket.emit("projects:user-invited", full);
      socket.broadcast.emit("projects:user-invited", full);
    } catch (err) {
      console.error("projects:invite-user", err);
      ack && ack({ ok: false, error: "server_error in projects:invite-user" });
    }
  });

  // 🔹 2. Remove user from project
  socket.on("projects:remove-user", async (payload, ack) => {
    try {
      audit(socket, "projects:remove-user", payload);
      const { project_id, user_id } = payload || {};
      if (!project_id || !user_id)
        return ack && ack({ ok: false, error: "missing_fields" });

      await ProjectMember.destroy({ where: { project_id, user_id } });

      ack && ack({ ok: true });
      socket.emit("projects:user-removed", { project_id, user_id });
      socket.broadcast.emit("projects:user-removed", { project_id, user_id });
    } catch (err) {
      console.error("projects:remove-user", err);
      ack && ack({ ok: false, error: "server_error in projects:remove-user" });
    }
  });

  // 🔹 3. Update role
  socket.on("projects:update-role", async (payload, ack) => {
    try {
      audit(socket, "projects:update-role", payload);
      const { project_id, user_id, role } = payload || {};
      await ProjectMember.update({ role }, { where: { project_id, user_id } });
      const updated = await ProjectMember.findOne({
        where: { project_id, user_id },
        include: [{ model: User, as: "user" }],
      });

      ack && ack({ ok: true, member: updated });
      socket.emit("projects:role-updated", updated);
      socket.broadcast.emit("projects:role-updated", updated);
    } catch (err) {
      console.error("projects:update-role", err);
      ack && ack({ ok: false, error: "server_error in projects:update-role" });
    }
  });

  // 🔹 4. List project members
  socket.on("projects:list-members", async (payload, ack) => {
    try {
      audit(socket, "projects:list-members", payload);
      const { project_id } = payload || {};
      const members = await ProjectMember.findAll({
        where: { project_id },
        include: [{ model: User, as: "user" }],
        order: [["created_at", "ASC"]],
      });
      ack && ack({ ok: true, members });
    } catch (err) {
      console.error("projects:list-members", err);
      ack && ack({ ok: false, error: "server_error in projects:list-members" });
    }
  });
};

/*

Example (frontend)
socket.emit("projects:invite-user", { project_id, user_id, role: "lead" });
socket.emit("projects:remove-user", { project_id, user_id });
socket.emit("projects:update-role", { project_id, user_id, role: "viewer" });
socket.emit("projects:list-members", { project_id }, (res) => {
  if (res.ok) setMembers(res.members);
});
*/