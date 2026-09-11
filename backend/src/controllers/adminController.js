const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { ApiError } = require("../utils/errors");
const { validateLogin } = require("../middleware/validators");

function signToken(admin) {
  return jwt.sign(
    { sub: String(admin.id), email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

async function login(req, res) {
  const { email, password } = validateLogin(req.body);

  const result = await db.query(
    "SELECT id, email, password_hash FROM admins WHERE email = $1",
    [email]
  );

  const admin = result.rows[0];
  const passwordOk = admin ? await bcrypt.compare(password, admin.password_hash) : false;

  // Réponse générique : ne révèle pas si le compte existe.
  if (!admin || !passwordOk) {
    throw new ApiError(401, "Email ou mot de passe incorrect.");
  }

  await db.query("UPDATE admins SET last_login = now() WHERE id = $1", [admin.id]);

  const token = signToken(admin);

  return res.json({
    success: true,
    token,
    admin: { id: admin.id, email: admin.email },
  });
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Identifiant invalide.");
  }
  return id;
}

async function listMessages(req, res) {
  const result = await db.query(
    `SELECT id, nom, email, message, statut, created_at, updated_at
     FROM messages
     ORDER BY created_at DESC`
  );

  const unreadCount = result.rows.filter((row) => row.statut === "UNREAD").length;

  return res.json({
    success: true,
    unreadCount,
    messages: result.rows,
  });
}

async function getMessage(req, res) {
  const id = parseId(req.params.id);

  const result = await db.query(
    `SELECT id, nom, email, message, statut, created_at, updated_at
     FROM messages WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Message introuvable.");
  }

  return res.json({ success: true, message: result.rows[0] });
}

async function setStatus(id, statut, res) {
  const result = await db.query(
    `UPDATE messages SET statut = $1
     WHERE id = $2
     RETURNING id, nom, email, message, statut, created_at, updated_at`,
    [statut, id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Message introuvable.");
  }

  return res.json({ success: true, message: result.rows[0] });
}

function markRead(req, res) {
  const id = parseId(req.params.id);
  return setStatus(id, "READ", res);
}

function markUnread(req, res) {
  const id = parseId(req.params.id);
  return setStatus(id, "UNREAD", res);
}

async function deleteMessage(req, res) {
  const id = parseId(req.params.id);

  const result = await db.query("DELETE FROM messages WHERE id = $1 RETURNING id", [id]);

  if (result.rowCount === 0) {
    throw new ApiError(404, "Message introuvable.");
  }

  return res.json({ success: true, message: "Message supprimé." });
}

module.exports = { login, listMessages, getMessage, markRead, markUnread, deleteMessage };