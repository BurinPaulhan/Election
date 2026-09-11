const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/errors");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Session invalide.",
      });
    }
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Session expirée. Reconnectez-vous.",
      });
    }
    return next(new ApiError(401, "Authentification requise."));
  }
}

module.exports = { requireAuth };