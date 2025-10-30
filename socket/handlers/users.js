const bcrypt = require("bcryptjs");
const models = require("../../models");
const { v4: uuidv4 } = require("uuid");
const { audit } = require("../../middleware/audit");
const { signAccessToken, generateRefreshTokenString } = require("../../middleware/jwt");


module.exports = function userSocketHandlers(socket) {
  // but ensure they check permissions (e.g., only admins can create other users).
  const { User, RefreshToken  } = models;

    // helper: create tokens for a user
    //Note: createTokensForUser creates and stores a refresh token in DB and returns both access and refresh tokens. The client stores them (preferably refresh token in an httpOnly cookie
    async function createTokensForUser(user) {
      const accessToken = signAccessToken({ id: user.id, username: user.username, role: user.role });
  
      const refreshTokenValue = generateRefreshTokenString();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days (or use env)
      const refreshToken = await RefreshToken.create({
        id: uuidv4(),
        user_id: user.id,
        token: refreshTokenValue,
        expires_at: expiresAt,
        revoked: false,
      });
  
      return { accessToken, refreshToken: refreshTokenValue, refreshTokenId: refreshToken.id, expiresAt };
    }
  // ---------------- REGISTER ----------------
  socket.on("register", async (data, ack) => {
    audit(socket, "register", data);
    try {
      const { username, password, name, role } = data;
      if (!username || !password) {
        return ack && ack({ ok: false, error: "username and password required" });
      }

      const existing = await User.findOne({ where: { username } });
      if (existing)
        return ack && ack({ ok: false, error: "User already exists" });

      const password_hash = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        id: uuidv4(),
        username,
        name,
        password_hash,
        role
      });

      // Create tokens so front-end can log in immediately
      const tokens = await createTokensForUser(newUser);

      // broadcast(Emit user created for other clients)
      socket.broadcast.emit("users:created", newUser);

      return ack && ack({ ok: true, user: newUser, token: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (err) {
      console.error("register error:", err);
      ack && ack({ ok: false, error: "Server error" });
    }
  });

  // ---------------- LOGIN ----------------
  socket.on("login", async (data, ack) => {
    audit(socket, "login", payload);

    try {
      const { username, password } = data;
      const user = await User.findOne({ where: { username } });
      if (!user)
        return ack && ack({ ok: false, error: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return ack && ack({ ok: false, error: "Incorrect password" });

      const tokens = await createTokensForUser(user);

      // Optionally, generate token or set userId on socket
      // socket.userId = user.id;
      // Attach minimal user info to socket (optionally)
      socket.user = { id: user.id, username: user.username, role: user.role };

      // Notify just the client that logged in
      socket.emit("login:success", user);

      // Optionally send others that user is online
      socket.broadcast.emit("users:updated", { id: user.id, online: true });

      // ack && ack({ ok: true, user });
      // Inform client
      ack && ack({ ok: true, user, token: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (err) {
      console.error("login error:", err);
      socket.emit("login:fail", "Server error");
      ack && ack({ ok: false, error: "Server error" });
    }
  });

  // ----- Refresh token handler -----
  // payload: { refreshToken }
  socket.on("auth:refresh", async (data, ack) => {
    try {
      const { refreshToken } = data || {};
      if (!refreshToken) return ack && ack({ ok: false, error: "missing_refresh_token" });

      const rt = await RefreshToken.findOne({ where: { token: refreshToken } });
      if (!rt || rt.revoked) return ack && ack({ ok: false, error: "invalid_refresh_token" });
      if (new Date(rt.expires_at) < new Date()) return ack && ack({ ok: false, error: "refresh_token_expired" });

      const user = await User.findByPk(rt.user_id);
      if (!user) return ack && ack({ ok: false, error: "user_not_found" });

      // rotate: revoke the used refresh token, create a new one
      await rt.update({ revoked: true });

      const tokens = await createTokensForUser(user);

      ack && ack({ ok: true, token: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (err) {
      console.error("auth:refresh error", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
  // ----- Logout (revoke a refresh token) -----
  // payload can be { refreshToken } or { refreshTokenId }
  socket.on("auth:logout", async (data, ack) => {
    try {
      const { refreshToken } = data || {};
      if (!refreshToken) {
        // If no token provided, optionally revoke all tokens for this user (if socket.user)
        if (socket.user && socket.user.id) {
          await RefreshToken.update({ revoked: true }, { where: { user_id: socket.user.id } });
          return ack && ack({ ok: true });
        }
        return ack && ack({ ok: false, error: "missing_refresh_token" });
      }

      const rt = await RefreshToken.findOne({ where: { token: refreshToken } });
      if (rt) await rt.update({ revoked: true });

      ack && ack({ ok: true });
    } catch (err) {
      console.error("auth:logout error", err);
      ack && ack({ ok: false, error: "server_error" });
    }
  });
  // ---------------- CRUD ----------------
  socket.on("users:create", async (payload, ack) => {
    audit(socket, "users:create", payload);

    try {
      const user = await User.create({ id: uuidv4(), ...payload });
      socket.broadcast.emit("users:created", user);
      ack && ack({ ok: true, user });
    } catch (err) {
      console.error(err);
      ack && ack({ ok: false, error: "Failed to create user" });
    }
  });

  socket.on("users:update", async (payload, ack) => {
    audit(socket, "users:create", payload);

    try {
      const { id, ...updates } = payload;
      await User.update(updates, { where: { id } });
      const updated = await User.findByPk(id);
      socket.broadcast.emit("users:updated", updated);
      ack && ack({ ok: true, user: updated });
    } catch (err) {
      console.error(err);
      ack && ack({ ok: false, error: "Failed to update user" });
    }
  });

  socket.on("users:delete", async (id, ack) => {
    audit(socket, "users:create", payload);

    try {
      await User.destroy({ where: { id } });
      socket.broadcast.emit("users:deleted", id);
      ack && ack({ ok: true });
    } catch (err) {
      console.error(err);
      ack && ack({ ok: false, error: "Failed to delete user" });
    }
  });
};









/*const User = require("../../models/user");
const { audit } = require("../../middleware/audit");
const bcrypt = require('bcrypt');


module.exports = function users(socket) {
    socket.on('register', async (payload, ack) => {
        audit(socket, 'register', payload);
        try {
          const { username, password } = payload || {};
          if (!username || !password) return ack && ack({ ok: false, error: 'username/password required' });
          const existing = await User.findOne({ where: { username } });
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
        audit(socket, 'login', payload);
        try {
          const { username, password } = payload || {};
          if (!username || !password) return ack && ack({ ok: false, error: 'username/password required' });
          const user = await User.findOne({ where: { username } });
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
        audit(socket, 'listUsers', ack);//???????????????????????????????????????????!!!!!!!!!!!!!!
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
        audit(socket, 'authenticate', payload);
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
};
*/
/*
When a user connects via Socket.IO:
io.on("connection", (socket) => {
  if (socket.user) {
    socket.join(socket.user.id); // join user room
  }
});
This makes io.to(user_id).emit("notifications:new", notif) deliver directly to that user.

*/