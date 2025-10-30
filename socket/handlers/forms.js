const Form = require("../../models/Form");
const {models} = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function forms(socket) {
  socket.on("forms:create", async (payload, ack) => {
    try {
      audit(socket, "forms:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
  
      const { v4: uuidv4 } = require("uuid");
      const { title, description, display_mode, fields, category_id, unit, form_code } = payload || {};
  
      const form = await models.Form.create({
        id: uuidv4(),
        title,
        description,
        display_mode: display_mode || "SINGLE_PAGE",
        fields,
        creator_id: socket.user.id,
        category_id,
        unit,
        form_code,
        version: "1.0",
        next_serial_number: 1,
      });
  
      ack && ack({ ok: true, form });
      socket.emit("forms:created", form);
      socket.broadcast.emit("forms:created", form);
    } catch (err) {
      console.error("forms:create", err);
      ack && ack({ ok: false, error: "server_error in forms:create" });
    }
  });

  socket.on("forms:update", async (payload, ack) => {
    try {
      audit(socket, "forms:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });
  
      await models.Form.update(updates, { where: { id } });
      const updated = await models.Form.findByPk(id, {
        include: [
          { model: models.FormCategory, as: "category" },
          { model: models.User, as: "creator" },
        ],
      });
  
      ack && ack({ ok: true, form: updated });
      socket.emit("forms:updated", updated);
      socket.broadcast.emit("forms:updated", updated);
    } catch (err) {
      console.error("forms:update", err);
      ack && ack({ ok: false, error: "server_error in forms:update" });
    }
  });

  socket.on("forms:toggle-pin", async (payload, ack) => {
    try {
      audit(socket, "forms:toggle-pin", payload);
      const { id } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });
  
      const form = await models.Form.findByPk(id);
      if (!form) return ack && ack({ ok: false, error: "not_found" });
  
      form.is_pinned = !form.is_pinned;
      await form.save();
  
      ack && ack({ ok: true, form });
      socket.emit("forms:pinned", form);
      socket.broadcast.emit("forms:pinned", form);
    } catch (err) {
      console.error("forms:toggle-pin", err);
      ack && ack({ ok: false, error: "server_error in forms:toggle-pin" });
    }
  });

  socket.on("forms:move-to-board", async (payload, ack) => {
    try {
      audit(socket, "forms:move-to-board", payload);
      const { id, category_id } = payload || {};
      if (!id || !category_id) return ack && ack({ ok: false, error: "missing_id_or_category" });
  
      await models.Form.update({ category_id }, { where: { id } });
      const updated = await models.Form.findByPk(id, {
        include: [{ model: models.FormCategory, as: "category" }],
      });
  
      ack && ack({ ok: true, form: updated });
      socket.emit("forms:moved", updated);
      socket.broadcast.emit("forms:moved", updated);
    } catch (err) {
      console.error("forms:move-to-board", err);
      ack && ack({ ok: false, error: "server_error in forms:move-to-board" });
    }
  });

  socket.on("forms:list", async (payload, ack) => {
    try {
      audit(socket, "forms:list", payload);
      const { category_id } = payload || {};
  
      const where = {};
      if (category_id) where.category_id = category_id;
  
      const forms = await models.Form.findAll({
        where,
        order: [["created_at", "DESC"]],
        include: [
          { model: models.FormCategory, as: "category" },
          { model: models.User, as: "creator" },
        ],
      });
  
      ack && ack({ ok: true, forms });
    } catch (err) {
      console.error("forms:list", err);
      ack && ack({ ok: false, error: "server_error in forms:list" });
    }
  });

  socket.on("forms:approve", async (payload, ack) => {
    try {
      audit(socket, "forms:approve", payload);
      const { id, approval_code } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });
  
      const approval_date = new Date();
  
      await models.Form.update({ approval_code, approval_date }, { where: { id } });
      const approved = await models.Form.findByPk(id);
  
      ack && ack({ ok: true, form: approved });
      socket.emit("forms:approved", approved);
      socket.broadcast.emit("forms:approved", approved);
    } catch (err) {
      console.error("forms:approve", err);
      ack && ack({ ok: false, error: "server_error in forms:approve" });
    }
  });

  socket.on("forms:increment-version", async (payload, ack) => {
    try {
      audit(socket, "forms:increment-version", payload);
      const { id } = payload || {};
      const form = await models.Form.findByPk(id);
      if (!form) return ack && ack({ ok: false, error: "not_found" });
  
      // Simple semver increment (e.g. "1.0" → "1.1")
      const [major, minor] = (form.version || "1.0").split(".").map(Number);
      const newVersion = `${major}.${(minor || 0) + 1}`;
      await form.update({ version: newVersion });
  
      ack && ack({ ok: true, form });
      socket.emit("forms:versioned", form);
      socket.broadcast.emit("forms:versioned", form);
    } catch (err) {
      console.error("forms:increment-version", err);
      ack && ack({ ok: false, error: "server_error in forms:increment-version" });
    }
  });

    // Soft delete
  socket.on("forms:delete", async (payload, ack) => {
    try {
      audit(socket, "forms:delete", payload);
      const { id } = payload || {};
      await models.Form.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("forms:deleted", { id });
      socket.broadcast.emit("forms:deleted", { id });
    } catch (err) {
      console.error("forms:delete", err);
      ack && ack({ ok: false, error: "server_error in forms:delete" });
    }
  });

  // Hard delete
  socket.on("forms:destroy", async (payload, ack) => {
    try {
      audit(socket, "forms:destroy", payload);
      const { id } = payload || {};
      await models.Form.destroy({ where: { id }, force: true });
      ack && ack({ ok: true });
      socket.emit("forms:destroyed", { id });
      socket.broadcast.emit("forms:destroyed", { id });
    } catch (err) {
      console.error("forms:destroy", err);
      ack && ack({ ok: false, error: "server_error in forms:destroy" });
    }
  });

  // Restore
  socket.on("forms:restore", async (payload, ack) => {
    try {
      audit(socket, "forms:restore", payload);
      const { id } = payload || {};
      await models.Form.restore({ where: { id } });
      const restored = await models.Form.findByPk(id);
      ack && ack({ ok: true, form: restored });
      socket.emit("forms:restored", restored);
      socket.broadcast.emit("forms:restored", restored);
    } catch (err) {
      console.error("forms:restore", err);
      ack && ack({ ok: false, error: "server_error in forms:restore" });
    }
  });

  
};



/*

// Create a new form
  socket.on("forms:create", async (payload) => {
    audit(socket, "forms:create", payload);
    const form = await Form.create(payload);
    socket.emit("forms:created", form);
    socket.broadcast.emit("forms:created", form);
  });

// Update an existing form
  socket.on("forms:update", async (payload) => {
    audit(socket, "forms:update", payload);
    await Form.update(payload, { where: { id: payload.id } });
    const updated = await Form.findByPk(payload.id);
    socket.emit("forms:updated", updated);
    socket.broadcast.emit("forms:updated", updated);
  });


  */


  /*

  /**createForm → creates a new form, assigns the creator automatically 
  socket.on("forms:create", async (payload, ack) => {
    audit(socket, "forms:create", payload);
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { id, title, description, category_id, display_mode, is_pinned } = payload || {};
      const form = await Form.create({
        id, title, description, category_id, display_mode, is_pinned, creator_id: socket.user.id
      });
      // const form = await Form.create(payload);???????????????????????????????

      ack && ack({ ok: true, form });
      // io.emit('formCreated', form); // notify all clients
      socket.emit("forms:created", form); // notify just clients
      socket.broadcast.emit("forms:created", form); //notify all clients

    } catch (err) {
      console.error("forms:create", err);
      ack && ack({ ok: false, error: 'server_error in formCreated' });
    }
  });


  /**updateForm → updates an existing form 
  socket.on("forms:update", async (payload, ack) => {
    audit(socket, "forms:update", payload);
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { formId, fields } = payload || {};
      const form = await Form.findByPk(formId);
      // const updated = await Form.findByPk(payload.id);
      if (!form) return ack && ack({ ok: false, error: 'not_found' });
      await form.update(fields);
      // await Form.update(payload, { where: { id: payload.id } });
      ack && ack({ ok: true, form });
      // io.emit('formUpdated', form); // notify all clients
      socket.emit("forms:updated", updated);
      socket.broadcast.emit("forms:updated", updated);

    } catch (err) {
      console.error("forms:update", err);
      ack && ack({ ok: false, error: 'server_error in form update' });
    }
  });

  /**listForms → gets all forms with their category and creator info 
  socket.on('listForms', async (payload, ack) => {//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    try {
      const forms = await Form.findAll({
        include: [
          { model: models.FormCategory, as: 'category', attributes: ['id','title','color'] },
          { model: models.User, as: 'creator', attributes: ['id','username'] }
        ],
        order: [['createdAt','DESC']]
      });
      ack && ack({ ok: true, forms });
    } catch (err) {
      console.error('listForms', err);
      ack && ack({ ok: false, error: 'server_error in list form' });
    }
  });
  // Toggle pin status !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  socket.on("forms:toggle-pin", async (formId) => {
    audit(socket, "forms:toggle-pin", formId);
    const form = await Form.findByPk(formId);
    form.isPinned = !form.isPinned;
    await form.save();
    socket.emit("forms:updated", form);
    socket.broadcast.emit("forms:updated", form);
  });

  // Move form to a board
  socket.on("forms:move-to-board", async ({ formId, boardId }) => {
    audit(socket, "forms:move-to-board", { formId, boardId });
    await Form.update({ boardId }, { where: { id: formId } });
    const updated = await Form.findByPk(formId);
    socket.emit("forms:updated", updated);
    socket.broadcast.emit("forms:updated", updated);
  });

  */

  /*

  ✅ Summary — Recommended Form Event Suite
Action              Event (in → out)                              Description

Create              forms:create → forms:created                  Create new form

Update              forms:update → forms:updated                  Edit form

List                forms:list → (ack only)                       Fetch forms (with filters)

Get one             forms:get → (ack only)                        Fetch single form

Delete              forms:delete → forms:deleted                  Soft delete

Destroy             forms:destroy → forms:destroyed               Hard delete

Restore             forms:restore → forms:restored                Restore deleted form

Toggle pin          forms:toggle-pin → forms:pinned               Pin/unpin a form

Move to board       forms:move-to-board → forms:moved             Change category

Approve             forms:approve → forms:approved                Mark form as approved

Increment version   forms:increment-version → forms:versioned     Bump version number


*/