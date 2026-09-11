-- ============================================================
-- Schéma de base de données — Plateforme de campagne AEMA
-- PostgreSQL 14+ recommandé. Ce fichier est rejouable (idempotent).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Table : messages (formulaire de contact public)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL DEFAULT 'Anonyme',
  email      VARCHAR(254) NOT NULL,
  message    TEXT         NOT NULL,
  statut     VARCHAR(10)  NOT NULL DEFAULT 'UNREAD'
             CHECK (statut IN ('UNREAD', 'READ')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_statut     ON messages (statut);

-- ------------------------------------------------------------
-- Table : admins (comptes administrateurs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

-- ------------------------------------------------------------
-- Mise à jour automatique de updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_updated_at ON messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;