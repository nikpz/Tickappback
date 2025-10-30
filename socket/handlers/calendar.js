// socketHandlers/calendar.js
const { CalendarEvent } = require("../models");

module.exports = (io, socket) => {
  socket.on("calendar:list", async (_, cb) => {
    try {
      const events = await CalendarEvent.findAll({ order: [["start", "ASC"]] });
      cb?.({ ok: true, events });
    } catch (err) {
      cb?.({ ok: false, error: err.message });
    }
  });

  socket.on("calendar:create", async (data, cb) => {
    try {
      const event = await CalendarEvent.create(data);
      socket.broadcast.emit("calendar:created", event);
      cb?.({ ok: true, event });
    } catch (err) {
      cb?.({ ok: false, error: err.message });
    }
  });

  socket.on("calendar:update", async (data, cb) => {
    try {
      await CalendarEvent.update(data, { where: { id: data.id } });
      const updated = await CalendarEvent.findByPk(data.id);
      socket.broadcast.emit("calendar:updated", updated);
      cb?.({ ok: true, event: updated });
    } catch (err) {
      cb?.({ ok: false, error: err.message });
    }
  });

  socket.on("calendar:delete", async (id, cb) => {
    try {
      await CalendarEvent.destroy({ where: { id } });
      socket.broadcast.emit("calendar:deleted", { id });
      cb?.({ ok: true });
    } catch (err) {
      cb?.({ ok: false, error: err.message });
    }
  });
};












/*const Calendar = require("../models/calendar");

module.exports = (socket) => {
  // list
  socket.on("calendar:list", async (_, cb) => {
    const list = Calendar.listCalendarEvents();
    cb?.({ ok: true, events: list });
  });

  // create
  socket.on("calendar:create", async (event, cb) => {
    const created = Calendar.createCalendarEvent(event);
    socket.broadcast.emit("calendar:created", created);
    cb?.({ ok: true, event: created });
  });

  // update
  socket.on("calendar:update", async (event, cb) => {
    const updated = Calendar.updateCalendarEvent(event);
    socket.broadcast.emit("calendar:updated", updated);
    cb?.({ ok: true, event: updated });
  });

  // delete
  socket.on("calendar:delete", async (id, cb) => {
    const result = Calendar.deleteCalendarEvent(id);
    socket.broadcast.emit("calendar:deleted", result);
    cb?.({ ok: true });
  });
};
*/