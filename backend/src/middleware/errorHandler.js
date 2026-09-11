function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
}

function errorHandler(err, req, res, next) {
  // Payload JSON trop volumineux (express.json)
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Données trop volumineuses.",
    });
  }

  // Erreurs de parsing JSON
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Corps de requête invalide.",
    });
  }

  const status = err.statusCode || err.status || 500;

  if (status >= 500) {
    console.error("[erreur serveur]", err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? "Une erreur interne est survenue." : err.message,
  });
}

module.exports = { notFound, errorHandler };