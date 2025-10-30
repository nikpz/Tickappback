require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, models } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const seedAll = require('./seeders/seed.js');
const { requireAuth } = require("./src/middleware/auth");//new
const registerSocketEvents = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Attach JWT auth middleware
io.use(requireAuth);

// // Register all socket event handlers
// io.on("connection", (socket) => {
//   console.log('client connected', socket.id, socket.user ? socket.user.username : '(unauthenticated)');
//   registerSocketEvents(socket);
// });

io.on('connection', (socket) => {
  console.log('client connected', socket.id, socket.user ? socket.user.username : '(unauthenticated)');

  // Helper to require auth for certain events
  function requireAuth(socket, ack) {
    if (!socket.user) {
      if (ack) ack({ ok: false, error: 'unauthorized' });
      return false;
    }
    return true;
  }

  socket.on('register', async (payload, ack) => {
    try {
      const { username, password } = payload || {};
      if (!username || !password) return ack && ack({ ok: false, error: 'username/password required' });
      const existing = await models.User.findOne({ where: { username } });
      if (existing) return ack && ack({ ok: false, error: 'username_taken' });
      const hash = await bcrypt.hash(password, 10);
      const user = await models.User.create({ username, passwordHash: hash });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
      ack && ack({ ok: true, user: { id: user.id, username: user.username }, token });
    } catch (err) {
      console.error('register err', err);
      ack && ack({ ok: false, error: 'server_error in register' });
    }
  });

  socket.on('login', async (payload, ack) => {
    try {
      const { username, password } = payload || {};
      if (!username || !password) return ack && ack({ ok: false, error: 'username/password required' });
      const user = await models.User.findOne({ where: { username } });
      if (!user) return ack && ack({ ok: false, error: 'invalid_credentials' });
      const okPw = await bcrypt.compare(password, user.passwordHash);
      if (!okPw) return ack && ack({ ok: false, error: 'invalid_credentials' });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
      // attach user to socket for this connection
      socket.user = { id: user.id, username: user.username };
      ack && ack({ ok: true, user: { id: user.id, username: user.username }, token });
    } catch (err) {
      console.error('login err', err);
      ack && ack({ ok: false, error: 'server_error in login' });
    }
  });
  //✅ Matches listUsers() from userService.ts.
  socket.on('listUsers', async (_, ack) => {
    try {
      const users = await models.User.findAll({
        attributes: ['id', 'username', 'createdAt']
      });
      ack && ack({ ok: true, users });
    } catch (err) {
      console.error('listUsers', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  socket.on('authenticate', async (payload, ack) => {
    try {
      const token = payload && payload.token;
      if (!token) return ack && ack({ ok: false, error: 'token required' });
      const payloadObj = jwt.verify(token, JWT_SECRET);
      const user = await models.User.findByPk(payloadObj.id);
      if (!user) return ack && ack({ ok: false, error: 'invalid_token' });
      socket.user = { id: user.id, username: user.username };
      ack && ack({ ok: true, user: { id: user.id, username: user.username } });
    } catch (err) {
      ack && ack({ ok: false, error: 'invalid_token' });
    }
  });

  socket.on('createTicket', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const { title, description } = payload || {};
      const ticket = await models.Ticket.create({ title, description, status: 'open', userId: socket.user.id });
      ack && ack({ ok: true, ticket });
      // broadcast to others that a new ticket exists
      io.emit('ticketCreated', ticket);
    } catch (err) {
      console.error('createTicket', err);
      ack && ack({ ok: false, error: 'server_error in createTicket' });
    }
  });

  socket.on('updateTicket', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const { ticketId, fields } = payload || {};
      const ticket = await models.Ticket.findByPk(ticketId);
      if (!ticket) return ack && ack({ ok: false, error: 'not_found' });
      await ticket.update(fields);
      ack && ack({ ok: true, ticket });
      io.emit('ticketUpdated', ticket);
    } catch (err) {
      console.error('updateTicket', err);
      ack && ack({ ok: false, error: 'server_error in updateTicket' });
    }
  });

  socket.on('listTickets', async (_, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const tickets = await models.Ticket.findAll({ include: [{ model: models.User, attributes: ['id','username'] }], order: [['createdAt','DESC']] });
      ack && ack({ ok: true, tickets });
    } catch (err) {
      console.error('listTickets', err);
      ack && ack({ ok: false, error: 'server_error in listTickets' });
    }
  });

  socket.on('joinTicket', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const { ticketId } = payload || {};
      const ticket = await models.Ticket.findByPk(ticketId);
      if (!ticket) return ack && ack({ ok: false, error: 'not_found' });
      const room = `ticket_${ticketId}`;
      socket.join(room);
      // send recent messages
      const messages = await models.Message.findAll({ where: { ticketId }, include: [{ model: models.User, attributes: ['id','username'] }], order: [['createdAt','ASC']] });
      ack && ack({ ok: true, ticket, messages });
    } catch (err) {
      console.error('joinTicket', err);
      ack && ack({ ok: false, error: 'server_error in joinTicket' });
    }
  });

  socket.on('leaveTicket', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const { ticketId } = payload || {};
      const room = `ticket_${ticketId}`;
      socket.leave(room);
      ack && ack({ ok: true });
    } catch (err) {
      console.error('leaveTicket', err);
      ack && ack({ ok: false, error: 'server_error in leaveTicket' });
    }
  });
  /* ========================FORM CATEGORIES======================== */
  /**Lists all categories and Can be used by front-end to populate dropdowns when creating forms */
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

  /* ========================FORMS======================== */
  /**listForms → gets all forms with their category and creator info */
  socket.on('listForms', async (payload, ack) => {
    try {
      const forms = await models.Form.findAll({
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

  /**createForm → creates a new form, assigns the creator automatically */
  socket.on('createForm', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { id, title, description, category_id, display_mode, is_pinned } = payload || {};
      const form = await models.Form.create({
        id, title, description, category_id, display_mode, is_pinned, creator_id: socket.user.id
      });
      ack && ack({ ok: true, form });
      io.emit('formCreated', form); // notify all clients
    } catch (err) {
      console.error('createForm', err);
      ack && ack({ ok: false, error: 'server_error in formCreated' });
    }
  });

  /**updateForm → updates an existing form */
  socket.on('updateForm', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { formId, fields } = payload || {};
      const form = await models.Form.findByPk(formId);
      if (!form) return ack && ack({ ok: false, error: 'not_found' });
      await form.update(fields);
      ack && ack({ ok: true, form });
      io.emit('formUpdated', form); // notify all clients
    } catch (err) {
      console.error('updateForm', err);
      ack && ack({ ok: false, error: 'server_error in form update' });
    }
  });

  /* ========================FORM SUBMISSIONS========================*/
  /**listFormSubmissions → gets all submissions of a form with user info */
  socket.on('listFormSubmissions', async ({ formId }, ack) => {
    try {
      const submissions = await models.FormSubmission.findAll({
        where: { form_id: formId },
        include: [
          { model: models.User, as: 'submittedBy', attributes: ['id','username'] }
        ],
        order: [['submitted_at','DESC']]
      });
      ack && ack({ ok: true, submissions });
    } catch (err) {
      console.error('listFormSubmissions', err);
      ack && ack({ ok: false, error: 'server_error in list form submissions' });
    }
  });

  /**createFormSubmission → adds a new submission and emits it to all connected clients */
  socket.on('createFormSubmission', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { id, form_id, values, serial_number, status } = payload || {};
      const submission = await models.FormSubmission.create({
        id,
        form_id,
        submitted_by_id: socket.user.id,
        values,
        serial_number,
        status,
        submitted_at: new Date()
      });
      ack && ack({ ok: true, submission });
      io.emit('formSubmissionCreated', submission); // notify all clients
    } catch (err) {
      console.error('createFormSubmission', err);
      ack && ack({ ok: false, error: 'server_error in form submission' });
    }
  });
  // Update form submission
  socket.on('updateFormSubmission', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { submissionId, fields } = payload || {};
      const submission = await models.FormSubmission.findByPk(submissionId);
      if (!submission) return ack && ack({ ok: false, error: 'not_found' });
      await submission.update(fields);
      ack && ack({ ok: true, data: submission });
      io.emit('formSubmissionUpdated', submission);
    } catch (err) {
      console.error('updateFormSubmission', err);
      ack && ack({ ok: false, error: 'server_error in updateFormSubmission' });
    }
  });

  /*************************List all teams*********************/ 
  /**✅ Matches teamService.ts (listTeams, createTeam, updateTeam). */
  socket.on('listTeams', async (_, ack) => {
    try {
      const teams = await models.Team.findAll({
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

  // Create a new team
  socket.on('createTeam', async (payload, ack) => {
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
      io.emit('teamCreated', team);
    } catch (err) {
      console.error('createTeam', err);
      ack && ack({ ok: false, error: 'server_error in create team' });
    }
  });

  socket.on('updateTeam', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { teamId, fields } = payload || {};
      const team = await models.Team.findByPk(teamId);
      if (!team) return ack && ack({ ok: false, error: 'not_found' });
      await team.update(fields);
      ack && ack({ ok: true, team });
      io.emit('teamUpdated', team);
    } catch (err) {
      console.error('updateTeam', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });
  // ======================== OBJECTIVES ========================
  /**✅ Matches projectService.ts. */
  socket.on('listObjectives', async (_, ack) => {
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

  socket.on('createObjective', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const objective = await models.Objective.create(payload);
      ack && ack({ ok: true, objective });
      io.emit('objectiveCreated', objective);
    } catch (err) {
      console.error('createObjective', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  /*******************Learning Assignment ******************* */
  socket.on('createLearningAssignment', async (payload, ack) => {
    //requireAuth(socket, ack) ensures only logged-in users can create/update/list assignments.
    if (!requireAuth(socket, ack)) return;
  
    try {
      const {
        assigneeId,
        resourceId,
        resourceType,
        status = 'ASSIGNED',
        triggerObjectiveId,
        triggerFeedbackId
      } = payload;
  
      const assignment = await models.LearningAssignment.create({
        id: `la_${Date.now()}`, // simple ID generation
        assignee_id: assigneeId,
        assigner_id: socket.user.id,
        resource_id: resourceId,
        resource_type: resourceType,
        assigned_at: new Date(),
        status,
        trigger_objective_id: triggerObjectiveId || null,
        trigger_feedback_id: triggerFeedbackId || null
      });
  
      const full = await models.LearningAssignment.findByPk(assignment.id, {
        include: ['assignee', 'assigner', 'bookResource', 'microLearningResource']
      });
  
      ack && ack({ ok: true, assignment: full });
      io.emit('learningAssignmentCreated', full); // broadcast
    } catch (err) {
      console.error('createLearningAssignment', err);
      ack && ack({ ok: false, error: 'server_error in createLearningAssignment' });
    }
  });
  socket.on('listLearningAssignments', async (_, ack) => {
    if (!requireAuth(socket, ack)) return;
  
    try {
      const assignments = await models.LearningAssignment.findAll({
        // include: ['assignee', 'assigner', 'bookResource', 'microLearningResource'],
        include: [
          { model: models.User, as: 'assignee', attributes: ['id', 'username'] },
          { model: models.User, as: 'assigner', attributes: ['id', 'username'] },
          { model: models.Book, as: 'book', attributes: ['id', 'title'] },
          { model: models.MicroLearning, as: 'microLearning', attributes: ['id', 'title'] },
          { model: models.YouTubeVideo, as: 'youTubeVideo', attributes: ['id', 'title'] }
        ],
        order: [['assigned_at', 'DESC']]
      });
  
      ack && ack({ ok: true, assignments });
    } catch (err) {
      console.error('listLearningAssignments', err);
      ack && ack({ ok: false, error: 'server_error in listLearningAssignments' });
    }
  });
  socket.on('updateLearningAssignment', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
  
    try {
      const { assignmentId, fields } = payload;
      const assignment = await models.LearningAssignment.findByPk(assignmentId);
  
      if (!assignment) return ack && ack({ ok: false, error: 'not_found' });
  
      await assignment.update(fields);
  
      const full = await models.LearningAssignment.findByPk(assignmentId, {
        include: ['assignee', 'assigner', 'bookResource', 'microLearningResource']
      });
  
      ack && ack({ ok: true, assignment: full });
      io.emit('learningAssignmentUpdated', full);
    } catch (err) {
      console.error('updateLearningAssignment', err);
      ack && ack({ ok: false, error: 'server_error in updateLearningAssignment' });
    }
  });
  // ======================== TASKS ========================
  /**✅ Matches taskService.ts. */
  socket.on('listTasks', async (_, ack) => {
    try {
      const tasks = await models.Task.findAll({
        include: [
          { model: models.User, as: 'assignee', attributes: ['id', 'username'] },
          { model: models.KanbanColumn, as: 'column', attributes: ['id', 'title', 'color'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      ack && ack({ ok: true, tasks });
    } catch (err) {
      console.error('listTasks', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  socket.on('createTask', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const task = await models.Task.create(payload);
      ack && ack({ ok: true, task });
      io.emit('taskCreated', task);
    } catch (err) {
      console.error('createTask', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  socket.on('updateTask', async (payload, ack) => {
    if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
    try {
      const { taskId, fields } = payload || {};
      const task = await models.Task.findByPk(taskId);
      if (!task) return ack && ack({ ok: false, error: 'not_found' });
      await task.update(fields);
      ack && ack({ ok: true, task });
      io.emit('taskUpdated', task);
    } catch (err) {
      console.error('updateTask', err);
      ack && ack({ ok: false, error: 'server_error' });
    }
  });

  /**************************Kanban Column ********************/
  socket.on('kanban:get-columns', async () => {
    const columns = await models.KanbanColumn.findAll({
      order: [['order', 'ASC']],
    });
    socket.emit('kanban:columns', columns);
  });

  socket.on('kanban:update-column', async (data) => {
    await models.KanbanColumn.update(data, {
      where: { id: data.id },
    });
    const updated = await models.KanbanColumn.findAll();
    io.emit('kanban:columns', updated);
  });
  socket.on('sendMessage', async (payload, ack) => {
    if (!requireAuth(socket, ack)) return;
    try {
      const { ticketId, content } = payload || {};
      if (!content) return ack && ack({ ok: false, error: 'empty_message' });
      const ticket = await models.Ticket.findByPk(ticketId);
      if (!ticket) return ack && ack({ ok: false, error: 'ticket_not_found' });
      const msg = await models.Message.create({ content, userId: socket.user.id, ticketId });
      const full = await models.Message.findByPk(msg.id, { include: [{ model: models.User, attributes: ['id','username'] }] });
      const room = `ticket_${ticketId}`;
      io.to(room).emit('message', full);
      ack && ack({ ok: true, message: full });
    } catch (err) {
      console.error('sendMessage', err);
      ack && ack({ ok: false, error: 'server_error in sendMessage' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('client disconnected', socket.id, reason);
  });
});




// start server after db connection/sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // sync tables - alter:true so it adjusts schema; in production use migrations
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ force: false });
      // await sequelize.sync({ alter: true});
      await sequelize.sync({ logging: console.log });
    }
    // await sequelize.sync({ alter: true });
    if (process.env.SEED === 'true') {
      // const { default: seed } = await import('./seed.js');  //if callback function on seed.js is unname
      await seedAll();
    };

    server.listen(PORT, () => {
      console.log('Server listening on port', PORT);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();
