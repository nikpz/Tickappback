// Example Node.js client using socket.io-client (install socket.io-client)
// This demonstrates register -> login -> createTicket -> joinTicket -> sendMessage
const { io } = require('socket.io-client');

async function run() {
  const socket = io('http://localhost:3000', { autoConnect: false });
  socket.on('connect', () => console.log('connected', socket.id));
  socket.on('message', (msg) => console.log('message', msg));
  socket.on('ticketCreated', (t) => console.log('ticketCreated', t));
  socket.on('ticketUpdated', (t) => console.log('ticketUpdated', t));

  socket.connect();

  // register
  socket.emit('register', { username: 'alice', password: 'pass123' }, (res) => {
    console.log('register', res);
    if (res.ok) {
      const token = res.token;
      // reconnect with token in handshake auth
      socket.auth = { token };
      // create ticket
      socket.emit('createTicket', { title: 'Help needed', description: 'Something broke' }, (r) => {
        console.log('createTicket', r);
        const ticketId = r.ticket.id;
        // join room and send message
        socket.emit('joinTicket', { ticketId }, (jr) => {
          console.log('joined', jr);
          socket.emit('sendMessage', { ticketId, content: 'Hello from client' }, (mr) => {
            console.log('message sent', mr);
          });
        });
      });
    }
  });
}

run();
