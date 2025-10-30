const KanbanColumn = require("../../models/KanbanColumn");
const {models} = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function columns(socket) {
  socket.on("columns:create", async (data) => {
    audit(socket, "columns:create", data);
    const column = await KanbanColumn.create(data);
    socket.emit("columns:created", column);
    socket.broadcast.emit("columns:created", column);
  });
  socket.on("columns:create", async (data) => {
    try {
      // Log who did what
      audit(socket, "columns:create", data);
      // Create a new column record
      const newColumn = await models.KanbanColumn.create({
        //If you’re using UUIDs for id, make sure data.id exists or generate one here:
        id: data.id,          // optional – only if you generate IDs manually (e.g. UUID)
        title: data.title,
        color: data.color || "gray",
        icon: data.icon || null,
        order: data.order ?? 0,
      });
  
      // Fetch all columns to broadcast updated board
      const updatedColumns = await models.KanbanColumn.findAll({
        order: [["order", "ASC"]], // ensures consistent order on the board
      });
      //You can alternatively return only the newly created column:
          //…but most Kanban frontends prefer the full, ordered list.
      // Send updated list to everyone
      socket.emit("columns:created", updatedColumns);          // to sender
      socket.broadcast.emit("columns:created", updatedColumns); // to others
  
    } catch (error) {
      console.error("Error creating column:", error);
      socket.emit("error", { event: "columns:create", message: error.message });
    }
  });

  socket.on('columns:update', async (data) => {
    try{
      audit(socket, "columns:update", data);
      //update the record
      await models.KanbanColumn.update(data, {
        where: { id: data.id },
      });
      //get all columns after update
      const updated = await KanbanColumn.findAll();
      //only get the updated one
      // const updated = await KanbanColumn.findByPk(data.id);
      // io.emit('kanban:columns', updated);
      socket.emit("columns:updated", updated);//back to sender
      socket.broadcast.emit("columns:updated", updated);// to others

      /*
      if you don't want to send allcolumns every time:
      const [rowUpdated] = await models.KanbanColumn.update(data, {
        where: {id: data.id},
        returning: true, //only works in postgres
      });
      if(rowsUpdated > 0){
        const updated = await models.KanbanColumn.findByPk(data.id);
        socket.emit("columns:updated", updated);
        socket.broadcast.emit("columns:updated", updated)
      }
      */
    }catch (error){
      console.error('Error updating column: ', error);
      socket.emit('error', {event: "columns:update", message: error.message});
    }
  });
};

  /**************************Kanban Column ********************/
  socket.on('kanban:get-columns', async () => { //incoming event
    try{
      const columns = await models.KanbanColumn.findAll({
        order: [['order', 'ASC']], //this keeps board layout consistent
      });
      socket.emit('kanban:columns', columns);
    }catch(error){
      console.error('Error fetching columns: ', error);
      socket.emit('error', {event: 'kanban:get-columns', message: error.message});
    }
  });
  socket.on('columns:delete', async (data) => {
    try{
      audit(socket, 'columns:delete', data);
      //soft delete means record remains in DB , but deletedAt gets filled
      await models.KanbanColumn.destroy({
        where: {id: data.id}
      });
      //Return updated list(excluding soft-deleted(paranoid: true))(only non-deleted rows)
      const updatedColumns = await models.KanbanColumn.findAll({
        order: [['order', 'ASC']]
      });
      socket.emit('columns:deleted', updatedColumns);
      socket.broadcast.emit('columns:deleted', updatedColumns);
    }catch(error){
      console.error('Error deleting column: ', error);
      socket.emit('error', {event: 'columns:deleted', message: error.message});
    }
  });
  // The “columns:destroy” (hard delete) event
  socket.on('columns:destroy', async (data) => {
    try {
      audit(socket, 'columns:destroy', data);
  
      await models.KanbanColumn.destroy({
        where: { id: data.id },
        force: true, // permanently delete, ignoring paranoid mode
      });
  
      const updatedColumns = await models.KanbanColumn.findAll({
        order: [['order', 'ASC']],
      });
  
      socket.emit('columns:destroyed', updatedColumns);
      socket.broadcast.emit('columns:destroyed', updatedColumns);
  
    } catch (error) {
      console.error('Error permanently deleting column:', error);
      socket.emit('error', { event: 'columns:destroy', message: error.message });
    }
  });
  //If you want to support restoring soft-deleted columns:
  socket.on('columns:restore', async (data) => {
    try {
      audit(socket, 'columns:restore', data);
  
      await models.KanbanColumn.restore({
        where: { id: data.id },
      });
  
      const updatedColumns = await models.KanbanColumn.findAll({
        order: [['order', 'ASC']],
      });
  
      socket.emit('columns:restored', updatedColumns);
      socket.broadcast.emit('columns:restored', updatedColumns);
  
    } catch (error) {
      console.error('Error restoring column:', error);
      socket.emit('error', { event: 'columns:restore', message: error.message });
    }
  });
  
/**Events:
 * 'columns:restore', 'columns:restored'
 * 'columns:destroy', 'columns:destroyed'
 * 'columns:delete', 'columns:deleted'
 * 'kanban:get-columns', kanban:columns'
 * "columns:update", "columns:updated"
 * "columns:create","columns:created"
 */
/*

socket.on("columns:update", async (data) => {
    audit(socket, "columns:update", data);
    await Column.update(data, { where: { id: data.id } });
    const updated = await Column.findByPk(data.id);
    socket.emit("columns:updated", updated);
    socket.broadcast.emit("columns:updated", updated);
  });

*/

/*

If your frontend is smart enough to insert the new column without refreshing the whole list:

socket.on("columns:create", async (data) => {
  try {
    audit(socket, "columns:create", data);
    const newColumn = await models.KanbanColumn.create(data);

    socket.emit("columns:created", newColumn);
    socket.broadcast.emit("columns:created", newColumn);
  } catch (error) {
    console.error("Error creating column:", error);
    socket.emit("error", { event: "columns:create", message: error.message });
  }
});

*/