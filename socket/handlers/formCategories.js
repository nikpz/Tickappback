const FormCategory = require("../../models/formCategory");
const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");

module.exports = function formCategories(socket) {

  socket.on("categories:create", async (payload, ack) => {
    try {
      audit(socket, "categories:create", payload);
      if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

      const { id, title, color } = payload || {};
      const category = await FormCategory.create({
        id: id || uuidv4(),
        title,
        color,
      });

      ack && ack({ ok: true, category });
      socket.emit("categories:created", category);
      socket.broadcast.emit("categories:created", category);
    } catch (err) {
      console.error("categories:create", err);
      ack && ack({ ok: false, error: "server_error in categories:create" });
    }
  });

  // 🔹 2. List all
  socket.on("categories:list", async (payload, ack) => {
    try {
      audit(socket, "categories:list", payload);
      const categories = await FormCategory.findAll({
        order: [["title", "ASC"]],
        include: [{ model: models.Form, as: "forms" }],
      });

      ack && ack({ ok: true, categories });
      // or optionally emit to this client only
      socket.emit("categories:list", categories);
    } catch (err) {
      console.error("categories:list", err);
      ack && ack({ ok: false, error: "server_error in categories:list" });
    }
  });

  // 🔹 3. Get one
  socket.on("categories:get", async (payload, ack) => {
    try {
      audit(socket, "categories:get", payload);
      const { id } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      const category = await FormCategory.findByPk(id, {
        include: [{ model: models.Form, as: "forms" }],
      });
      if (!category) return ack && ack({ ok: false, error: "not_found" });

      ack && ack({ ok: true, category });
    } catch (err) {
      console.error("categories:get", err);
      ack && ack({ ok: false, error: "server_error in categories:get" });
    }
  });

  // 🔹 4. Update
  socket.on("categories:update", async (payload, ack) => {
    try {
      audit(socket, "categories:update", payload);
      const { id, ...updates } = payload || {};
      if (!id) return ack && ack({ ok: false, error: "missing_id" });

      await FormCategory.update(updates, { where: { id } });
      const updated = await FormCategory.findByPk(id);

      //Uses ack for acknowledgment (so your client can get { ok, data } back).
      ack && ack({ ok: true, category: updated });
      socket.emit("categories:updated", updated);
      socket.broadcast.emit("categories:updated", updated);
    } catch (err) {
      console.error("categories:update", err);
      ack && ack({ ok: false, error: "server_error in categories:update" });
    }
  });

  // 🔹 5. Soft delete
  socket.on("categories:delete", async (payload, ack) => {
    try {
      audit(socket, "categories:delete", payload);
      const { id } = payload || {};
      await FormCategory.destroy({ where: { id } });


      //Uses ack for acknowledgment (so your client can get { ok, data } back).
      ack && ack({ ok: true });
      socket.emit("categories:deleted", { id });
      socket.broadcast.emit("categories:deleted", { id });
    } catch (err) {
      console.error("categories:delete", err);
      ack && ack({ ok: false, error: "server_error in categories:delete" });
    }
  });

  // 🔹 6. Hard delete
  socket.on("categories:destroy", async (payload, ack) => {
    try {
      audit(socket, "categories:destroy", payload);
      const { id } = payload || {};
      await FormCategory.destroy({ where: { id }, force: true });

      //Uses ack for acknowledgment (so your client can get { ok, data } back).
      ack && ack({ ok: true });
      socket.emit("categories:destroyed", { id });
      socket.broadcast.emit("categories:destroyed", { id });
    } catch (err) {
      console.error("categories:destroy", err);
      ack && ack({ ok: false, error: "server_error in categories:destroy" });
    }
  });

  // 🔹 7. Restore soft-deleted
  socket.on("categories:restore", async (payload, ack) => {
    try {
      audit(socket, "categories:restore", payload);
      const { id } = payload || {};
      await FormCategory.restore({ where: { id } });
      const restored = await FormCategory.findByPk(id);

      //Uses ack for acknowledgment (so your client can get { ok, data } back).
      ack && ack({ ok: true, category: restored });
      socket.emit("categories:restored", restored);
      socket.broadcast.emit("categories:restored", restored);
    } catch (err) {
      console.error("categories:restore", err);
      ack && ack({ ok: false, error: "server_error in categories:restore" });
    }
  });

};




/*

Then in your socket/index.js or main server:

const registerHandlers = require('./socket-handlers');

io.on('connection', (socket) => {
  registerHandlers(io, socket, models, audit);
});
And registerHandlers can automatically load all files in /socket-handlers/.

*/





/*

/* ========================FORM CATEGORIES======================== 
  /**Lists all categories and Can be used by front-end to populate dropdowns when creating forms 
  socket.on('listFormCategories', async (payload, ack) => {
    try {
      const categories = await models.FormCategory.findAll({ order: [['title','ASC']] });
      ack && ack({ ok: true, categories });
    } catch (err) {
      console.error('listFormCategories', err);
      ack && ack({ ok: false, error: 'server_error in list form categories' });
    }
  });
  // Create category
  socket.on('createFormCategory', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { id, title, color } = payload || {};
      const category = await models.FormCategory.create({ id, title, color });
      ack && ack({ ok: true, data: category });
      io.emit('formCategoryCreated', category);
    } catch (err) {
      console.error('createFormCategory', err);
      ack && ack({ ok: false, error: 'server_error in createFormCategory' });
    }
  });
  // Update category
  socket.on('updateFormCategory', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { categoryId, fields } = payload || {};
      const category_id = categoryId;
      const category = await models.FormCategory.findByPk(category_id);
      if (!category) return ack && ack({ ok: false, error: 'not_found' });
      await category.update(fields);
      ack && ack({ ok: true, data: category });
      io.emit('formCategoryUpdated', category);
    } catch (err) {
      console.error('updateFormCategory', err);
      ack && ack({ ok: false, error: 'server_error in updateFormCategory' });
    }
  });


*/