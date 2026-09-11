const { Pool } = require("pg");

let pool = null;

function initPool() {
  if (!process.env.DATABASE_URL) {
    console.warn("[database] DATABASE_URL absent — la connexion PostgreSQL n'est pas initialisée.");
    return null;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("[database] Erreur inattendue du pool PostgreSQL :", err.message);
  });

  return pool;
}

initPool();

module.exports = {
  query(text, params) {
    if (!pool) {
      throw new Error("Base de données non configurée (DATABASE_URL manquant).");
    }
    return pool.query(text, params);
  },
  pool,
};