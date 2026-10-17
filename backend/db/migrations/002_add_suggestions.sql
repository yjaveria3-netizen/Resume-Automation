-- ============================================================================
-- Migration 002 — Day 11
-- Human-in-the-Loop review queue: bullet_suggestions
-- Person E (Database, Automation & Coordinator)
-- ============================================================================
-- Apply:
--   psql "$DATABASE_URL" -f backend/db/migrations/002_add_suggestions.sql
--   psql "$DATABASE_URL" -c "\d bullet_suggestions"
--
-- Rollback (run only if you must undo this migration):
--   DROP INDEX IF EXISTS idx_suggestions_user_status;
--   DROP TABLE IF EXISTS bullet_suggestions;
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bullet_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    commit_sha TEXT,
    commit_message TEXT,
    proposed_bullet TEXT NOT NULL,
    diff_summary JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast inbox queries: "pending suggestions for this user, newest first"
CREATE INDEX IF NOT EXISTS idx_suggestions_user_status
    ON bullet_suggestions (user_id, status, created_at DESC);

COMMENT ON TABLE bullet_suggestions IS
    'AI-proposed resume bullets waiting for human accept/dismiss (review queue).';
COMMENT ON COLUMN bullet_suggestions.status IS
    'pending = waiting in queue; accepted = written into resume; dismissed = rejected.';
