const Team = require("../../models/Team");
const {models} = require("../../models");
const { audit } = require("../../middleware/audit");

module.exports = function teams(socket) {
  /*************************List all teams*********************/ 
  /**✅ Matches teamService.ts (listTeams, createTeam, updateTeam). */
  socket.on('listTeams', async (_, ack) => {
    try {
      const teams = await Team.findAll({
        include: [
          { model: models.User, as: 'lead', attributes: ['id','username','name'] },
          { model: models.User, as: 'members', attributes: ['id','username','name'] },
        ]
      });
      ack && ack({ ok: true, teams });
    } catch (err) {
      console.error('listTeams', err);
      ack && ack({ ok: false, error: 'server_error in list teams' });
    }
  });

  // socket.on('createTeam', async (payload, ack) => {
  socket.on("teams:create", async (payload, ack) => {
      audit(socket, "teams:create", data);
      if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { id, name, leadId, icon, category, memberIds = [] } = payload;
      const team = await models.Team.create({ id, name, leadId, icon, category });
      //memberIds is only in your mock data or front-end.

      // Associate members with this team
      if (memberIds.length > 0) {
        await models.User.update(
          { teamId: team.id },
          { where: { id: memberIds } }
        );
      }

      ack && ack({ ok: true, team });
      // io.emit('teamCreated', team);
      socket.emit("teams:created", team);
      socket.broadcast.emit("teams:created", team);
    } catch (err) {
      // console.error('createTeam', err);
      console.error("teams:created", err);
      ack && ack({ ok: false, error: 'server_error in create team' });
    }
  });

  socket.on("teams:update", async (payload, ack) => {
    audit(socket, "teams:update", data);
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { teamId, fields } = payload || {};
      const team = await models.Team.findByPk(teamId);
      // const updated = await Team.findByPk(data.id);
      if (!team) return ack && ack({ ok: false, error: 'not_found' });
      await team.update(fields);
      // await Team.update(data, { where: { id: data.id } });/
      ack && ack({ ok: true, team });
      // io.emit('teamUpdated', team);
      socket.emit("teams:updated", updated);
      socket.broadcast.emit("teams:updated", updated);
    } catch (err) {
      console.error("teams:update", err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  socket.on("teams:delete", async (teamId) => {
    audit(socket, "teams:delete", teamId);
    await Team.destroy({ where: { id: teamId } });
    socket.emit("teams:deleted", teamId);
    socket.broadcast.emit("teams:deleted", teamId);
  });

  socket.on("teams:set", (teams) => {
    audit(socket, "teams:set", teams);
    socket.emit("teams:set", teams);
  });
};


/*

  socket.on("teams:create", async (data) => {
    audit(socket, "teams:create", data);
    const team = await Team.create(data);
    socket.emit("teams:created", team);
    socket.broadcast.emit("teams:created", team);
  });

  socket.on("teams:update", async (data) => {
    audit(socket, "teams:update", data);
    await Team.update(data, { where: { id: data.id } });
    const updated = await Team.findByPk(data.id);
    socket.emit("teams:updated", updated);
    socket.broadcast.emit("teams:updated", updated);
  });
*/