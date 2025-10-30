const models = require("../../models");
// const KeyResult = require("../../models/KeyResult");
const { audit } = require("../../middleware/audit");

const { Objective, KeyResult, User, Strategy, Project } = models;
 
module.exports = function objectives(socket) {
  // 🔹 1. Create Objective (with optional KeyResults)
  socket.on("objectives:create-with-krs", async (payload, ack) => {
    try {
      audit(socket, "objectives:create-with-krs", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { objectiveData, keyResultsData } = payload || {};
      const id = uuidv4();

      const objective = await Objective.create({
        id,
        title: objectiveData.title,
        description: objectiveData.description,
        category: objectiveData.category,
        owner_id: objectiveData.owner_id || socket.user.id,
        strategy_id: objectiveData.strategy_id,
        parent_id: objectiveData.parent_id,
      });

      if (Array.isArray(keyResultsData) && keyResultsData.length > 0) {
        for (const kr of keyResultsData) {
          await KeyResult.create({
            id: uuidv4(),
            objective_id: id,
            title: kr.title,
            target: kr.target,
            current: kr.current || 0,
            unit: kr.unit,
          });
        }
      }

      const created = await Objective.findByPk(id, {
        include: [
          { model: User, as: "owner" },
          { model: Strategy, as: "strategy" },
          { model: KeyResult, as: "keyResults" },
        ],
      });

      ack && ack({ ok: true, objective: created });
      socket.emit("objectives:created", created);
      socket.broadcast.emit("objectives:created", created);
    } catch (err) {
      console.error("objectives:create-with-krs", err);
      ack && ack({ ok: false, error: "server_error in objectives:create-with-krs" });
    }
  });

  // 🔹 2. Update Objective
  socket.on("objectives:update", async (payload, ack) => {
    try {
      audit(socket, "objectives:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await Objective.update(updates, { where: { id } });
      const updated = await Objective.findByPk(id, {
        include: [
          { model: User, as: "owner" },
          { model: Strategy, as: "strategy" },
          { model: KeyResult, as: "keyResults" },
        ],
      });

      ack && ack({ ok: true, objective: updated });
      socket.emit("objectives:updated", updated);
      socket.broadcast.emit("objectives:updated", updated);
    } catch (err) {
      console.error("objectives:update", err);
      ack && ack({ ok: false, error: "server_error in objectives:update" });
    }
  });

  // 🔹 3. Delete Objective (soft delete)
  socket.on("objectives:delete", async (objectiveId, ack) => {
    try {
      audit(socket, "objectives:delete", { objectiveId });
      await Objective.destroy({ where: { id: objectiveId } });
      ack && ack({ ok: true });
      socket.emit("objectives:deleted", { id: objectiveId });
      socket.broadcast.emit("objectives:deleted", { id: objectiveId });
    } catch (err) {
      console.error("objectives:delete", err);
      ack && ack({ ok: false, error: "server_error in objectives:delete" });
    }
  });

  // 🔹 4. Restore soft-deleted objective
  socket.on("objectives:restore", async (payload, ack) => {
    try {
      audit(socket, "objectives:restore", payload);
      const { id } = payload || {};
      await Objective.restore({ where: { id } });
      const restored = await Objective.findByPk(id);
      ack && ack({ ok: true, objective: restored });
      socket.emit("objectives:restored", restored);
      socket.broadcast.emit("objectives:restored", restored);
    } catch (err) {
      console.error("objectives:restore", err);
      ack && ack({ ok: false, error: "server_error in objectives:restore" });
    }
  });

  // 🔹 5. Create Key Result
  socket.on("objectives:create-kr", async (payload, ack) => {
    try {
      audit(socket, "objectives:create-kr", payload);
      const { objectiveId, krData } = payload;
      const newKR = await KeyResult.create({
        id: uuidv4(),
        objective_id: objectiveId,
        ...krData,
      });
      ack && ack({ ok: true, keyResult: newKR });
      socket.emit("objectives:kr-created", newKR);
      socket.broadcast.emit("objectives:kr-created", newKR);
    } catch (err) {
      console.error("objectives:create-kr", err);
      ack && ack({ ok: false, error: "server_error in objectives:create-kr" });
    }
  });

  // 🔹 6. Update Key Result
  socket.on("objectives:update-kr", async (payload, ack) => {
    try {
      audit(socket, "objectives:update-kr", payload);
      const { krId, updates } = payload;
      await KeyResult.update(updates, { where: { id: krId } });
      const updated = await KeyResult.findByPk(krId);
      ack && ack({ ok: true, keyResult: updated });
      socket.emit("objectives:kr-updated", updated);
      socket.broadcast.emit("objectives:kr-updated", updated);
    } catch (err) {
      console.error("objectives:update-kr", err);
      ack && ack({ ok: false, error: "server_error in objectives:update-kr" });
    }
  });

  // 🔹 7. Delete Key Result
  socket.on("objectives:delete-kr", async (payload, ack) => {
    try {
      audit(socket, "objectives:delete-kr", payload);
      const { keyResultId } = payload;
      await KeyResult.destroy({ where: { id: keyResultId } });
      ack && ack({ ok: true });
      socket.emit("objectives:kr-deleted", { id: keyResultId });
      socket.broadcast.emit("objectives:kr-deleted", { id: keyResultId });
    } catch (err) {
      console.error("objectives:delete-kr", err);
      ack && ack({ ok: false, error: "server_error in objectives:delete-kr" });
    }
  });

  // 🔹 8. Check-in Key Result (progress update)
  socket.on("objectives:check-in", async (payload, ack) => {
    try {
      audit(socket, "objectives:check-in", payload);
      const { krId, value, rating, report, challengeDifficulty, challengeTagIds } = payload;

      await KeyResult.update(
        { current: value, rating, last_report: report },
        { where: { id: krId } }
      );

      const updated = await KeyResult.findByPk(krId);
      ack && ack({ ok: true, keyResult: updated });
      socket.emit("objectives:checked-in", updated);
      socket.broadcast.emit("objectives:checked-in", updated);
    } catch (err) {
      console.error("objectives:check-in", err);
      ack && ack({ ok: false, error: "server_error in objectives:check-in" });
    }
  });
  
};

/*

  // Create objective with key results
  socket.on("objectives:create-with-krs", async ({ objectiveData, keyResultsData }) => {
    audit(socket, "objectives:create-with-krs", { objectiveData, keyResultsData });
    const objective = await Objective.create(objectiveData);
    const krs = await Promise.all(
      keyResultsData.map(data => KeyResult.create({ ...data, objectiveId: objective.id }))
    );
    socket.emit("objectives:created", { ...objective.toJSON(), keyResults: krs });
    socket.broadcast.emit("objectives:created", { ...objective.toJSON(), keyResults: krs });
  });

*/


/*

// ======================== OBJECTIVES ========================
  /**✅ Matches projectService.ts. 
  socket.on('listObjectives', async (_, ack) => {
    audit(socket, 'listObjectives', { _, ack });
    try {
      const objectives = await models.Objective.findAll({
        include: [{ model: models.User, as: 'owner', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']]
      });
      ack && ack({ ok: true, objectives });
    } catch (err) {
      console.error('listObjectives', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  // socket.on('createObjective', async (payload, ack) => {
  socket.on("objectives:create-with-krs", async ({ objectiveData, keyResultsData }) => {
    audit(socket, "objectives:create-with-krs", { objectiveData, keyResultsData });
      // if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const objective = await Objective.create(objectiveData);
      const krs = await Promise.all(
        keyResultsData.map(data => KeyResult.create({ ...data, objectiveId: objective.id }))
      );
      // ack && ack({ ok: true, objective });
      // io.emit('objectiveCreated', objective);
      socket.emit("objectives:created", { ...objective.toJSON(), keyResults: krs });
      socket.broadcast.emit("objectives:created", { ...objective.toJSON(), keyResults: krs });
    } catch (err) {
      console.error('createObjective', err);
      // ack && ack({ ok: false, error: 'server_error' });
    }
  });


  // Check-in for a key result
  socket.on("objectives:check-in", async (payload) => {
    audit(socket, "objectives:check-in", payload);
    // Placeholder — implement CheckIn model
    const checkin = { ...payload, id: Date.now() };
    socket.emit("objectives:updated", checkin);
    socket.broadcast.emit("objectives:updated", checkin);
  });

  // Add comment to a key result
  socket.on("objectives:add-comment", async (payload) => {
    audit(socket, "objectives:add-comment", payload);
    // Placeholder — implement Comment model
    const comment = { ...payload, id: Date.now() };
    socket.emit("objectives:updated", comment);
    socket.broadcast.emit("objectives:updated", comment);
  });

  // Delete objective
  socket.on("objectives:delete", async (id) => {
    audit(socket, "objectives:delete", id);
    await Objective.destroy({ where: { id } });
    socket.emit("objectives:deleted", id);
    socket.broadcast.emit("objectives:deleted", id);
  });

  // Delete key result
  socket.on("objectives:delete-kr", async ({ objectiveId, keyResultId }) => {
    audit(socket, "objectives:delete-kr", { objectiveId, keyResultId });
    await KeyResult.destroy({ where: { id: keyResultId, objectiveId } });
    socket.emit("objectives:deleted", keyResultId);
    socket.broadcast.emit("objectives:deleted", keyResultId);
  });

  // Update objective
  socket.on("objectives:update", async (payload) => {
    audit(socket, "objectives:update", payload);
    await Objective.update(payload, { where: { id: payload.id } });
    const updated = await Objective.findByPk(payload.id);
    socket.emit("objectives:updated", updated);
    socket.broadcast.emit("objectives:updated", updated);
  });

  // Update key result
  socket.on("objectives:update-kr", async ({ objectiveId, krId, updates }) => {
    audit(socket, "objectives:update-kr", { objectiveId, krId, updates });
    await KeyResult.update(updates, { where: { id: krId, objectiveId } });
    const updated = await KeyResult.findByPk(krId);
    socket.emit("objectives:updated", updated);
    socket.broadcast.emit("objectives:updated", updated);
  });

  */
