const db = require("../config/database");
const { validateContactMessage } = require("../middleware/validators");

async function createMessage(req, res) {
  const { nom, email, message } = validateContactMessage(req.body);

  await db.query(
    "INSERT INTO messages (nom, email, message) VALUES ($1, $2, $3) RETURNING id",
    [nom, email, message]
  );

  return res.status(201).json({
    success: true,
    message: "Votre message a bien été envoyé.",
  });
}

module.exports = { createMessage };