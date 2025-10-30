require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, models } = require('./models');
const seedAll = require('./seeders/seed.js');
const { requireAuth } = require("./middleware/auth");//new
const registerSocketEvents = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Attach JWT auth middleware
io.use(requireAuth);

// Register all socket event handlers
io.on('connection', (socket) => {
  console.log('client connected', socket.id, socket.user ? socket.user.username : '(unauthenticated)');
  registerSocketEvents(socket);

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


/*
In your main server file (where you initialize Socket.IO):

const { startFlusher } = require("./utils/notificationBuffer");

// after DB + socket setup
startFlusher(io, models);
That’s it — the server will flush aggregated notifications every 10 seconds.
*/
/*
io.use(async (socket, next) => {
  try {
    // Prefer token from handshake auth (recommended for socket.io-client v4)
    const tokenFromAuth = socket.handshake.auth?.token;
    // Also allow Authorization header
    const header = socket.handshake.headers?.authorization;
    const tokenFromHeader = header && header.split(" ")[1];

    const token = tokenFromAuth || tokenFromHeader;
    if (!token) return next(); // allow unauthenticated sockets too (optional)

    const payload = verifyAccessToken(token);
    if (!payload) return next(new Error("Authentication error"));

    // Attach user to socket (minimal info)
    socket.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    console.error("socket auth error", err);
    return next(new Error("Authentication error"));
  }
});
*/
/*

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

*/