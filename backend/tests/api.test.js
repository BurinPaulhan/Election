const assert = require("node:assert");
require("dotenv").config();

const db = require("../src/config/database");
const bcrypt = require("bcryptjs");
const app = require("../src/server");

const TEST_ADMIN_PASSWORD = "TestAdmin123!Cible";

let server;
let baseUrl;
let testAdminId;
let testAdminEmail = `test-${Date.now()}@example.com`;
let insertedMessageIds = [];

async function api(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}

async function createTempAdmin() {
  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10);
  const result = await db.query(
    "INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id",
    [testAdminEmail, passwordHash]
  );
  testAdminId = result.rows[0].id;
}

async function cleanup() {
  if (insertedMessageIds.length > 0) {
    await db.query("DELETE FROM messages WHERE id = ANY($1)", [insertedMessageIds]);
  }
  if (testAdminId) {
    await db.query("DELETE FROM admins WHERE id = $1", [testAdminId]);
  }
}

let passed = 0;
let failed = 0;

function record(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
}

async function run() {
  await startServer();
  await db.query("SELECT 1"); // vérifie la connexion PostgreSQL dès le départ
  await createTempAdmin();

  // ------------------------------------------------------------
  // 1. GET /health
  // ------------------------------------------------------------
  const health = await api("GET", "/health");
  record("GET /health → 200", health.status === 200 && health.data.success === true);

  // ------------------------------------------------------------
  // 2. POST /api/messages — données valides
  // ------------------------------------------------------------
  const ok = await api("POST", "/api/messages", {
    body: { nom: "Jean Dupont", email: "jean@example.com", message: "Bonjour, je souhaite vous soutenir." },
  });
  record("POST /api/messages valide → 201", ok.status === 201 && ok.data.success === true, `status=${ok.status}`);

  // Consigne les ids de TOUS les messages de test pour les nettoyer ensuite.
  const testRows = await db.query(
    "SELECT id FROM messages WHERE email IN ($1, $2)",
    ["jean@example.com", "e2e-clean-test@example.com"]
  );
  insertedMessageIds.push(...testRows.rows.map((row) => row.id));

  const inserted = await api("POST", "/api/messages", {
    body: { nom: "Jean Dupont", email: "jean@example.com", message: "Message de vérification PostgreSQL." },
  });
  const insertedInDb = await db.query(
    "SELECT id, email, statut FROM messages WHERE email = $1 ORDER BY id DESC LIMIT 1",
    ["jean@example.com"]
  );
  record(
    "Donnée réellement présente dans PostgreSQL",
    insertedInDb.rowCount === 1 && insertedInDb.rows[0].statut === "UNREAD"
  );
  const target = insertedInDb.rows[0]?.id;

  // ------------------------------------------------------------
  // 4. POST /api/messages — email vide (facultatif)
  // ------------------------------------------------------------
  const noEmail = await api("POST", "/api/messages", {
    body: { nom: "Sans Email", message: "Message sans adresse e-mail." },
  });
  record("POST /api/messages email vide → 201", noEmail.status === 201 && noEmail.data.success === true);
  const noEmailInDb = await db.query(
    "SELECT id, email FROM messages WHERE nom = $1 ORDER BY id DESC LIMIT 1",
    ["Sans Email"]
  );
  record(
    "Email vide enregistré comme chaîne vide",
    noEmailInDb.rowCount === 1 && noEmailInDb.rows[0].email === ""
  );
  if (noEmailInDb.rowCount === 1) {
    insertedMessageIds.push(noEmailInDb.rows[0].id);
  }

  // ------------------------------------------------------------
  // 5. POST /api/messages — email invalide
  // ------------------------------------------------------------
  const badEmail = await api("POST", "/api/messages", {
    body: { email: "pas-un-email", message: "Test email invalide" },
  });
  record("POST /api/messages email invalide → 400", badEmail.status === 400 && badEmail.data.success === false);

  // ------------------------------------------------------------
  // 6. POST /api/messages — message vide
  // ------------------------------------------------------------
  const empty = await api("POST", "/api/messages", {
    body: { email: "jean@example.com", message: "   " },
  });
  record("POST /api/messages message vide → 400", empty.status === 400 && empty.data.success === false);

  // ------------------------------------------------------------
  // 7. POST /api/admin/login — mauvais mot de passe
  // ------------------------------------------------------------
  const wrongLogin = await api("POST", "/api/admin/login", {
    body: { email: testAdminEmail, password: "mauvais-mot-de-passe" },
  });
  record("POST login mauvais mot de passe → 401", wrongLogin.status === 401 && wrongLogin.data.success === false);
  record(
    "Réponse de login générique (ne révèle pas le compte)",
    (wrongLogin.data.message || "").toLowerCase().includes("incorrect")
  );

  // ------------------------------------------------------------
  // 8. GET /api/admin/messages — sans authentification
  // ------------------------------------------------------------
  const noAuth = await api("GET", "/api/admin/messages");
  record("GET /api/admin/messages sans auth → 401", noAuth.status === 401);

  // ------------------------------------------------------------
  // 9. POST /api/admin/login — bons identifiants
  // ------------------------------------------------------------
  const goodLogin = await api("POST", "/api/admin/login", {
    body: { email: testAdminEmail, password: TEST_ADMIN_PASSWORD },
  });
  record("POST login bons identifiants → 200 + token", goodLogin.status === 200 && typeof goodLogin.data.token === "string");
  const token = goodLogin.data.token;

  // ------------------------------------------------------------
  // 10. GET /api/admin/messages — avec authentification
  // ------------------------------------------------------------
  const list = await api("GET", "/api/admin/messages", { token });
  record("GET /api/admin/messages avec auth → 200", list.status === 200 && Array.isArray(list.data.messages));
  const foundTarget = Array.isArray(list.data.messages)
    ? list.data.messages.some((m) => m.id === target)
    : false;
  record("Le message inséré apparaît dans la liste", foundTarget);
  record("Le message inséré est en statut UNREAD", list.data.unreadCount >= 1);

  // ------------------------------------------------------------
  // 11. GET /api/admin/messages/:id
  // ------------------------------------------------------------
  const one = await api("GET", `/api/admin/messages/${target}`, { token });
  record("GET /api/admin/messages/:id → 200", one.status === 200 && one.data.message.id === target);

  // ------------------------------------------------------------
  // 12. PATCH /api/admin/messages/:id/read
  // ------------------------------------------------------------
  const read = await api("PATCH", `/api/admin/messages/${target}/read`, { token });
  record("PATCH /read → 200 + statut READ", read.status === 200 && read.data.message.statut === "READ");

  // ------------------------------------------------------------
  // 13. PATCH /api/admin/messages/:id/unread
  // ------------------------------------------------------------
  const unread = await api("PATCH", `/api/admin/messages/${target}/unread`, { token });
  record("PATCH /unread → 200 + statut UNREAD", unread.status === 200 && unread.data.message.statut === "UNREAD");

  // ------------------------------------------------------------
  // 14. DELETE /api/admin/messages/:id + vérification PostgreSQL
  // ------------------------------------------------------------
  const del = await api("DELETE", `/api/admin/messages/${target}`, { token });
  const stillThere = await db.query("SELECT id FROM messages WHERE id = $1", [target]);
  record("DELETE /api/admin/messages/:id → 200", del.status === 200 && del.data.success === true);
  record("Message effectivement supprimé de PostgreSQL", stillThere.rowCount === 0);

  // ------------------------------------------------------------
  // 15. POST /api/messages — flush propre : le "delete" interdit côté admin
  //     (tous les messages de test sont consignés dans insertedMessageIds)
  // ------------------------------------------------------------
}

run()
  .then(async () => {
    await cleanup();
  })
  .catch(async (err) => {
    console.error("Erreur de test :", err.message);
    failed += 1;
    await cleanup();
  })
  .finally(() => {
    if (server) {
      server.close();
    }
    console.log(`\nRésultat : ${passed} réussi(s), ${failed} échec(s)`);
    process.exit(failed === 0 ? 0 : 1);
  });