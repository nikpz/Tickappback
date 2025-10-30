const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
// Simple middleware for socket auth using token in handshake query or via 'authenticate' event
async function requireAuth(socket, next) {
  // check token in handshake auth (socket.io v4 supports handshake.auth)
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await models.User.findByPk(payload.id);
      if (user) {
        socket.user = { id: user.id, username: user.username };
      }
      if (user?.preferences) {
        socket.emit("settings:loaded", user.preferences);
      }
    } catch (err) {
      // invalid token - proceed unauthenticated, allow some events like login/register
      next(new Error("Invalid token"));
    }
  }
  return next();
}

module.exports = { requireAuth };
