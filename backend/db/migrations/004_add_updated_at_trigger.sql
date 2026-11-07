-- ============================================================================
-- Migration 004 — Day 12 follow-up
-- Auto-update bullet_suggestions.updated_at whenever a row is changed
-- Person E (Database, Automation & Coordinator)
-- ============================================================================
-- Why: updated_at only had DEFAULT now(), which runs on INSERT. Without a
-- trigger it stays at the creation time when status changes from
-- 'pending' to 'accepted' / 'dismissed', so the audit trail is wrong.
-- (C++ comparison: like a setter that always stamps the time for you, so
-- no caller can forget to do it.)
--
-- Apply (Supabase SQL Editor): paste this whole file and Run.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_bullet_suggestions_updated_at ON bullet_suggestions;
--   DROP FUNCTION IF EXISTS set_updated_at();
-- ============================================================================
 
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