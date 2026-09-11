const path = require("path");

// S'exécute depuis backend/ (npm run seed:admin). CWD = backend.
const backendRoot = process.cwd();
const { Client } = require(path.join(backendRoot, "node_modules", "pg"));
const bcrypt = require(path.join(backendRoot, "node_modules", "bcryptjs"));
require(path.join(backendRoot, "node_modules", "dotenv")).config({
  path: path.join(backendRoot, ".env"),
});

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
const BCRYPT_ROUNDS = 10;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("ADMIN_EMAIL est manquant ou invalide dans backend/.env.");
  process.exit(1);
}
if (!password) {
  console.error("ADMIN_PASSWORD est manquant dans backend/.env.");
  process.exit(1);
}
if (["CHANGE_ME", "CHANGE_ME_PROD"].includes(password)) {
  console.error("Le mot de passe ADMIN_PASSWORD doit être modifié avant la création du compte.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Le mot de passe administrateur doit contenir au moins 12 caractères.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL absent. Renseignez backend/.env (voir .env.example).");
  process.exit(1);
}

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const existing = await client.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );

    if (existing.rowCount > 0) {
      console.log(`Un administrateur existe déjà pour ${email}. Aucune modification.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await client.query(
      "INSERT INTO admins (email, password_hash) VALUES ($1, $2)",
      [email, passwordHash]
    );

    console.log(`Administrateur créé : ${email}`);
  } finally {
    await client.end();
  }
}

seed()
  .catch((err) => {
    console.error("Erreur lors de la création de l'administrateur :", err.message);
    process.exit(1);
  });