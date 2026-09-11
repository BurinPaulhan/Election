const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Autorise les origines explicites (FRONTEND_URL), les previews/déploiements
// Vercel (*.vercel.app) et le développement local — les requêtes sans en-tête
// Origin (curl, health checks) sont également acceptées.
function isAllowedOrigin(origin, callback) {
  const allowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    /\.vercel\.app$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  callback(null, allowed);
}

app.disable("x-powered-by");

app.use(
  cors({
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

// Limiteur global de l'API (protection de base contre les abus).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de requêtes. Réessayez plus tard.",
  },
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AEMA Election API fonctionne",
  });
});

app.use("/api", apiLimiter);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur AEMA démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;