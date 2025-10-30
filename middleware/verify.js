const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { verifyAccessToken };

/*
const socket = io(SOCKET_URL, { auth: { token: localStorage.getItem("accessToken") } });
*/