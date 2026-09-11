const path = require("path");
const fs = require("fs");

// Les scripts vivent dans database/ mais s'exécutent depuis backend/ (npm run db:init).
const backendRoot = process.cwd();
const { Client } = require(path.join(backendRoot, "node_modules", "pg"));
require(path.join(backendRoot, "node_modules", "dotenv")).config({
  path: path.join(backendRoot, ".env"),
});

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL absent. Renseignez backend/.env (voir .env.example).");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query("COMMIT");
    console.log("Schéma de base de données initialisé avec succès.");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // pas de transaction active → ignorer
    }
    throw err;
  } finally {
    await client.end();
  }
}

run()
  .catch((err) => {
    console.error("Erreur lors de l'initialisation du schéma :", err.message);
    process.exit(1);
  });