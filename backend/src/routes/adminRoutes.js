const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  login,
  listMessages,
  getMessage,
  markRead,
  markUnread,
  deleteMessage,
} = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// Protection contre le brute-force : 10 tentatives / 15 min / IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Réessayez plus tard.",
  },
});

// Route publique (toutes les autres routes sont protégées ci-dessous).
router.post("/login", loginLimiter, asyncHandler(login));

// Tout le reste nécessite un JWT valide.
router.use(requireAuth);

router.get("/messages", asyncHandler(listMessages));
router.get("/messages/:id", asyncHandler(getMessage));
router.patch("/messages/:id/read", asyncHandler(markRead));
router.patch("/messages/:id/unread", asyncHandler(markUnread));
router.delete("/messages/:id", asyncHandler(deleteMessage));

module.exports = router;