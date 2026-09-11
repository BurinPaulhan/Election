const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

function shouldUseSsl() {
  if (process.env.DATABASE_SSL === "true") {
    return true;
  }
  if (!DATABASE_URL) {
    return false;
  }
  return /(?:[?&])(?:sslmode=(?:require|verify|verify-ca|verify-full)|ssl=true)/i.test(DATABASE_URL);
}

let pool = null;

function initPool() {
  if (!DATABASE_URL) {
    console.warn("[database] DATABASE_URL absent — la connexion PostgreSQL n'est pas initialisée.");
    return null;
  }

  const config = {
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  if (shouldUseSsl()) {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);

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