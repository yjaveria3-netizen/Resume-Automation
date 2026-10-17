-- Migration 004: auto-update bullet_suggestions.updated_at on every UPDATE
-- (C++ comparison: like a setter that always stamps the time, so no caller can forget)
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_bullet_suggestions_updated_at ON bullet_suggestions;
--   DROP FUNCTION IF EXISTS set_updated_at();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bullet_suggestions_updated_at ON bullet_suggestions;

CREATE TRIGGER trg_bullet_suggestions_updated_at
BEFORE UPDATE ON bullet_suggestions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
