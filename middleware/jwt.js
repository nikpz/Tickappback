const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateRefreshTokenString() {
  // cryptographically secure refresh token string
  return crypto.randomBytes(48).toString("hex");
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshTokenString,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
};