const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { createMessage } = require("../controllers/messageController");
const asyncHandler = require("../utils/asyncHandler");

// Protection raisonnable du formulaire public : 20 messages / 15 min / IP.
const messagesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de messages envoyés. Réessayez plus tard.",
  },
});

router.post("/", messagesLimiter, asyncHandler(createMessage));

module.exports = router;