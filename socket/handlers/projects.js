const models = require("../../models");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function projects(socket) {
  const { Project, Objective, Workspace } = models;

  // 🔹 1. Create project
  socket.on("projects:create", async (payload, ack) => {
    try {
      audit(socket, "projects:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const {
        name,
        objective_id,
        color,
        description,
        mission_statement,
        workspace_id,
        is_pinned,
      } = payload || {};

      const project = await Project.create({
        id: uuidv4(),
        name,
        objective_id,
        color,
        description,
        mission_statement,
        workspace_id,
        is_pinned: !!is_pinned,
      });

      const full = await Project.findByPk(project.id, {
        include: [
          { model: Objective, as: "objective" },
          { model: Workspace, as: "workspace" },
        ],
      });

      ack && ack({ ok: true, project: full });
      socket.emit("projects:created", full);
      socket.broadcast.emit("projects:created", full);
    } catch (err) {
      console.error("projects:create", err);
      ack && ack({ ok: false, error: "server_error in projects:create" });
    }
  });

  // 🔹 2. Update project
  socket.on("projects:update", async (payload, ack) => {
    try {
      audit(socket, "projects:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Project.update(updates, { where: { id } });
      const updated = await Project.findByPk(id, {
        include: [
          { model: Objective, as: "objective" },
          { model: Workspace, as: "workspace" },
        ],
      });

      ack && ack({ ok: true, project: updated });
      socket.emit("projects:updated", updated);
      socket.broadcast.emit("projects:updated", updated);
    } catch (err) {
      console.error("projects:update", err);
      ack && ack({ ok: false, error: "server_error in projects:update" });
    }
  });

  // 🔹 3. Archive / Unarchive (handled via update)
  // Frontend calls: socket.emit("projects:update", { id, isArchived: true/false })

  // 🔹 4. List projects
  socket.on("projects:list", async (payload, ack) => {
    try {
      audit(socket, "projects:list", payload);
      const { workspace_id, includeArchived } = payload || {};
      const where = {};
      if (workspace_id) where.workspace_id = workspace_id;
      if (!includeArchived) where.is_archived = false;

      const projects = await Project.findAll({
        where,
        order: [["created_at", "ASC"]],
        include: [{ model: Objective, as: "objective" }],
      });

      ack && ack({ ok: true, projects });
    } catch (err) {
      console.error("projects:list", err);
      ack && ack({ ok: false, error: "server_error in projects:list" });
    }
  });

  // 🔹 5. Delete (soft)
  socket.on("projects:delete", async (payload, ack) => {
    try {
      audit(socket, "projects:delete", payload);
      const { id } = payload || {};
      await Project.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("projects:deleted", { id });
      socket.broadcast.emit("projects:deleted", { id });
    } catch (err) {
      console.error("projects:delete", err);
      ack && ack({ ok: false, error: "server_error in projects:delete" });
    }
  });

  // 🔹 6. Restore (un-delete)
  socket.on("projects:restore", async (payload, ack) => {
    try {
      audit(socket, "projects:restore", payload);
      const { id } = payload || {};
      await Project.restore({ where: { id } });
      const restored = await Project.findByPk(id);
      ack && ack({ ok: true, project: restored });
      socket.emit("projects:restored", restored);
      socket.broadcast.emit("projects:restored", restored);
    } catch (err) {
      console.error("projects:restore", err);
      ack && ack({ ok: false, error: "server_error in projects:restore" });
    }
  });

  // 🔹 7. Custom fields handling
  socket.on("projects:add-custom-field", async (payload, ack) => {
    try {
      audit(socket, "projects:add-custom-field", payload);
      const { projId, definition } = payload || {};
      const project = await Project.findByPk(projId);
      if (!project) return ack && ack({ ok: false, error: "project_not_found" });

      const current = project.custom_fields || [];
      const updated = [...current, definition];

      await project.update({ custom_fields: updated });
      ack && ack({ ok: true, project });
      socket.emit("projects:custom-field-added", { projId, definition });
      socket.broadcast.emit("projects:custom-field-added", { projId, definition });
    } catch (err) {
      console.error("projects:add-custom-field", err);
      ack && ack({ ok: false, error: "server_error in projects:add-custom-field" });
    }
  });

  socket.on("projects:update-custom-field", async (payload, ack) => {
    try {
      audit(socket, "projects:update-custom-field", payload);
      const { projId, defId, updates } = payload || {};
      const project = await Project.findByPk(projId);
      if (!project) return ack && ack({ ok: false, error: "project_not_found" });

      const fields = (project.custom_fields || []).map((f) =>
        f.id === defId ? { ...f, ...updates } : f
      );

      await project.update({ custom_fields: fields });
      ack && ack({ ok: true, project });
      socket.emit("projects:custom-field-updated", { projId, defId, updates });
      socket.broadcast.emit("projects:custom-field-updated", { projId, defId, updates });
    } catch (err) {
      console.error("projects:update-custom-field", err);
      ack && ack({ ok: false, error: "server_error in projects:update-custom-field" });
    }
  });

  socket.on("projects:delete-custom-field", async (payload, ack) => {
    try {
      audit(socket, "projects:delete-custom-field", payload);
      const { projId, defId } = payload || {};
      const project = await Project.findByPk(projId);
      if (!project) return ack && ack({ ok: false, error: "project_not_found" });

      const fields = (project.custom_fields || []).filter((f) => f.id !== defId);
      await project.update({ custom_fields: fields });
      ack && ack({ ok: true, project });
      socket.emit("projects:custom-field-deleted", { projId, defId });
      socket.broadcast.emit("projects:custom-field-deleted", { projId, defId });
    } catch (err) {
      console.error("projects:delete-custom-field", err);
      ack && ack({ ok: false, error: "server_error in projects:delete-custom-field" });
    }
  });

   //When someone is invited to a project
  // await createNotification(io, models, {
  //   user_id,
  //   type: "project",
  //   item_id: project_id,
  //   message: `👋 You were added to project "${project.name}"`,
  // });

};




/*

socket.on("projects:create", async (data) => {
    audit(socket, "projects:create", data);
    const project = await Project.create(data);
    socket.emit("projects:created", project);
    socket.broadcast.emit("projects:created", project);
  });

  socket.on("projects:update", async (data) => {
    audit(socket, "projects:update", data);
    await Project.update(data, { where: { id: data.id } });
    const updated = await Project.findByPk(data.id);
    socket.emit("projects:updated", updated);
    socket.broadcast.emit("projects:updated", updated);
  });

  socket.on("projects:add-custom-field", async ({ projId, definition }) => {
    audit(socket, "projects:add-custom-field", { projId, definition });
    // Placeholder logic — implement CustomField model
    const field = { projId, definition };
    socket.emit("projects:updated", field);
    socket.broadcast.emit("projects:updated", field);
  });

  socket.on("projects:update-custom-field", async ({ projId, defId, updates }) => {
    audit(socket, "projects:update-custom-field", { projId, defId, updates });
    // Placeholder logic
    const updated = { projId, defId, ...updates };
    socket.emit("projects:updated", updated);
    socket.broadcast.emit("projects:updated", updated);
  });

  socket.on("projects:delete-custom-field", async ({ projId, defId }) => {
    audit(socket, "projects:delete-custom-field", { projId, defId });
    // Placeholder logic
    socket.emit("projects:deleted", defId);
    socket.broadcast.emit("projects:deleted", defId);
  });

  */