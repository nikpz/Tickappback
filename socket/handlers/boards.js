const models = require("../../models");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function boards(socket) {
  const { Board, Project, KanbanColumn } = models;

  // 🔹 1. Create Board
  socket.on("boards:create", async (payload, ack) => {
    try {
      audit(socket, "boards:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { title, description, project_id, isPinned, order, settings } = payload || {};

      const board = await Board.create({
        id: uuidv4(),
        title,
        description,
        project_id,
        isPinned: !!isPinned,
        order: order ?? 0,
        settings,
      });

      ack && ack({ ok: true, board });
      socket.emit("boards:created", board);
      socket.broadcast.emit("boards:created", board);
    } catch (err) {
      console.error("boards:create", err);
      ack && ack({ ok: false, error: "server_error in boards:create" });
    }
  });

  // 🔹 2. Update Board
  socket.on("boards:update", async (payload, ack) => {
    try {
      audit(socket, "boards:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Board.update(updates, { where: { id } });
      const updated = await Board.findByPk(id, {
        include: [{ model: Project, as: "project" }],
      });

      ack && ack({ ok: true, board: updated });
      socket.emit("boards:updated", updated);
      socket.broadcast.emit("boards:updated", updated);
    } catch (err) {
      console.error("boards:update", err);
      ack && ack({ ok: false, error: "server_error in boards:update" });
    }
  });

  // 🔹 3. Delete (soft)
  socket.on("boards:delete", async (payload, ack) => {
    try {
      audit(socket, "boards:delete", payload);
      const { id } = payload || {};
      await Board.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("boards:deleted", { id });
      socket.broadcast.emit("boards:deleted", { id });
    } catch (err) {
      console.error("boards:delete", err);
      ack && ack({ ok: false, error: "server_error in boards:delete" });
    }
  });

  // 🔹 4. Toggle pin
  socket.on("boards:toggle-pin", async (payload, ack) => {
    try {
      audit(socket, "boards:toggle-pin", payload);
      const { id } = payload || {};
      const board = await Board.findByPk(id);
      if (!board) return ack && ack({ ok: false, error: "not_found" });

      board.isPinned = !board.isPinned;
      await board.save();

      ack && ack({ ok: true, board });
      socket.emit("boards:pinned", board);
      socket.broadcast.emit("boards:pinned", board);
    } catch (err) {
      console.error("boards:toggle-pin", err);
      ack && ack({ ok: false, error: "server_error in boards:toggle-pin" });
    }
  });

  // 🔹 5. Reorder
  socket.on("boards:reorder", async (payload, ack) => {
    try {
      audit(socket, "boards:reorder", payload);
      const { orderedIds } = payload || {};
      if (!Array.isArray(orderedIds)) return ack && ack({ ok: false, error: "invalid_data" });

      await Promise.all(
        orderedIds.map((id, index) =>
          Board.update({ order: index }, { where: { id } })
        )
      );

      const updated = await Board.findAll({ order: [["order", "ASC"]] });
      ack && ack({ ok: true, boards: updated });
      socket.emit("boards:reordered", updated);
      socket.broadcast.emit("boards:reordered", updated);
    } catch (err) {
      console.error("boards:reorder", err);
      ack && ack({ ok: false, error: "server_error in boards:reorder" });
    }
  });

  // 🔹 6. List Boards
  socket.on("boards:list", async (payload, ack) => {
    try {
      audit(socket, "boards:list", payload);
      const boards = await Board.findAll({
        order: [["order", "ASC"]],
        include: [
          { model: Project, as: "project" },
          { model: KanbanColumn, as: "columns" },
        ],
      });
      ack && ack({ ok: true, boards });
    } catch (err) {
      console.error("boards:list", err);
      ack && ack({ ok: false, error: "server_error in boards:list" });
    }
  });
};

 



/*

 socket.on("boards:create", async (data) => {
    audit(socket, "boards:create", data);
    const board = await Board.create(data);
    socket.emit("boards:created", board);
    socket.broadcast.emit("boards:created", board);
  });

  socket.on("boards:update", async (data) => {
    audit(socket, "boards:update", data);
    await Board.update(data, { where: { id: data.id } });
    const updated = await Board.findByPk(data.id);
    socket.emit("boards:updated", updated);
    socket.broadcast.emit("boards:updated", updated);
  });

  */