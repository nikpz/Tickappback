Tickup Backend (Socket.io + Postgres + Sequelize)
================================================
What this is
- A Node.js backend that uses socket.io for all client-server communication (no REST).
- Sequelize + Postgres for persistence. Tables are auto-created with `sequelize.sync()`.
- JWT-based authentication over sockets.

Quick start
1. Install dependencies:
   npm install

2. Create a Postgres database and update .env:
   - You can use the DATABASE_URL format: postgres://user:pass@host:port/dbname
   - Copy .env.example to .env and edit values.

3. Start the server:
   npm start
   or for development: npm run dev

Socket API (overview)
- register: { username, password } -> returns { ok, user, token }
- login: { username, password } -> returns { ok, user, token }
- authenticate: { token } -> returns { ok, user }
- createTicket: { title, description } -> returns created ticket
- updateTicket: { ticketId, fields } -> returns updated ticket
- listTickets: no payload -> returns array of tickets visible to user
- joinTicket: { ticketId } -> join socket room for ticket; you'll receive messages for that ticket
- leaveTicket: { ticketId } -> leave room
- sendMessage: { ticketId, content } -> saves message and broadcasts to room

Notes & Caveats
- This is intentionally simple and stores passwords (hashed) and JWT secrets locally.
- No Redis or external queues are used.
- No REST endpoints are provided; everything happens over socket.io events.
- Tables are created automatically via sequelize.sync({ alter: true }) — for production you may want migrations.

If you'd like, I can:
- Add migrations instead of sync
- Add unit tests
- Add a small web-based client that uses socket.io to interact with this backend
