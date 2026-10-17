-- ============================================================================
-- Migration 003 — Day 12
-- Job matcher + 1-page strictness: job_descriptions, archived_projects
-- Person E (Database, Automation & Coordinator)
-- ============================================================================
-- Apply:
--   psql "$DATABASE_URL" -f backend/db/migrations/003_add_jd_and_archives.sql
--   psql "$DATABASE_URL" -c "\dt *"
--
-- Rollback:
--   DROP INDEX IF EXISTS idx_jd_user_id;
--   DROP INDEX IF EXISTS idx_jd_resume_id;
--   DROP INDEX IF EXISTS idx_archived_projects_user;
--   DROP TABLE IF EXISTS archived_projects;
--   DROP TABLE IF EXISTS job_descriptions;
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Target job descriptions pasted by the user. Match score and keyword
-- JSON let Person D's matcher explain why a resume fits (or misses) a JD.
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    title TEXT,
    jd_text TEXT NOT NULL,
    match_score INT,
    matched_keywords JSONB,
    missing_keywords JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects swapped off the 1-page resume. Not deleted: stored so a later
-- JD can pull them back (tailoring without losing history).
CREATE TABLE IF NOT EXISTS archived_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    tech_stack TEXT[],
    bullet_point TEXT,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jd_user_id
    ON job_descriptions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jd_resume_id
    ON job_descriptions (resume_id);

CREATE INDEX IF NOT EXISTS idx_archived_projects_user
    ON archived_projects (user_id, archived_at DESC);

COMMENT ON TABLE job_descriptions IS
    'Job descriptions and keyword match results for resume tailoring.';
COMMENT ON TABLE archived_projects IS
    'Projects removed from the 1-page resume but kept for future JD matching.';
