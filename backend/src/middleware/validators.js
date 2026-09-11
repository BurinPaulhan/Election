const { ApiError } = require("../utils/errors");

const MAX_NOM = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Valide et normalise le payload du formulaire de contact public.
 * Renvoie { nom, email, message } normalisés.
 * Lève une ApiError (400) si le payload est invalide.
 */
function validateContactMessage(body) {
  const source = body && typeof body === "object" ? body : {};

  const nom = typeof source.nom === "string" ? source.nom.trim() : "";
  const email = normalizeEmail(source.email);
  const message = typeof source.message === "string" ? source.message.trim() : "";

  if (nom.length > MAX_NOM) {
    throw new ApiError(400, "Le nom ne doit pas dépasser 100 caractères.");
  }
  // Email facultatif : s'il est renseigné, il doit être valide et raisonnable.
  if (email) {
    if (email.length > MAX_EMAIL) {
      throw new ApiError(400, "L'adresse e-mail est trop longue.");
    }
    if (!EMAIL_RE.test(email)) {
      throw new ApiError(400, "L'adresse e-mail est invalide.");
    }
  }
  if (!message) {
    throw new ApiError(400, "Votre message est requis.");
  }
  if (message.length < MIN_MESSAGE) {
    throw new ApiError(400, "Votre message est trop court.");
  }
  if (message.length > MAX_MESSAGE) {
    throw new ApiError(400, "Votre message ne doit pas dépasser 5000 caractères.");
  }

  return { nom: nom || "Anonyme", email, message };
}

/**
 * Valide et normalise le payload de connexion administrateur.
 * Renvoie { email, password }. Ne lève jamais d'erreur 404 spécifique.
 */
function validateLogin(body) {
  const source = body && typeof body === "object" ? body : {};

  const email = normalizeEmail(source.email);
  const password = typeof source.password === "string" ? source.password : "";

  if (!email || !password) {
    throw new ApiError(400, "Email et mot de passe requis.");
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    throw new ApiError(400, "Email invalide.");
  }

  return { email, password };
}

module.exports = { validateContactMessage, validateLogin };