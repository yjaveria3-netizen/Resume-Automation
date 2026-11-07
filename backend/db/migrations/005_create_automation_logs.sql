-- ============================================================================
-- Migration 005: create automation_logs table
-- Used by the n8n workflow (Resume-Auto-Updater-GitHub-Trigger) to log
-- every pipeline run (SUCCESS / FAILED) after the backend call.
-- Person E (Database, Automation & Coordinator)
-- ============================================================================
--
-- Apply (Supabase SQL Editor): paste this whole file and Run.
--
-- Rollback:
--   DROP TABLE IF EXISTS automation_logs;
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_logs (
    id            BIGSERIAL PRIMARY KEY,
    repo_name     TEXT,
    user_id       UUID,
    status        VARCHAR(20) NOT NULL,
    error_message TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);