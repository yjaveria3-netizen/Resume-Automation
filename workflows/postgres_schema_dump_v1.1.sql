-- Resume Auto-Updater PostgreSQL schema dump v1.1 (Day 13 archive)
-- Concatenation of scheme.sql + views.sql + migrations 002-004.
-- Apply on a fresh database in this order.


-- ========== backend/db/scheme.sql ==========

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE github_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    ats_score INTEGER,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[],
    rank_score INTEGER,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_name TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ========== backend/db/views.sql ==========

-- ============================================================================
-- Day 7: Optimized Database Views & Performance Indexes
-- Persona: Person E (Database, Automation & Coordinator)
-- ============================================================================

-- 1. Composite Performance Indexes for Sub-Millisecond Lookups
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id_created 
ON resume_versions(resume_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_user_id_rank 
ON projects(user_id, rank_score DESC);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id 
ON resumes(user_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_github_accounts_user_id 
ON github_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id 
ON automation_logs(user_id, created_at DESC);


-- 2. View 1: v_user_dashboard_summary
-- Aggregates user info, connected GitHub account, latest resume ID,
-- original filename, latest version number, latest ATS score, and last updated timestamp in one query.
CREATE OR REPLACE VIEW v_user_dashboard_summary AS
WITH latest_resumes AS (
    SELECT DISTINCT ON (user_id)
        id AS resume_id,
        user_id,
        original_filename,
        uploaded_at
    FROM resumes
    ORDER BY user_id, uploaded_at DESC
),
latest_versions AS (
    SELECT DISTINCT ON (resume_id)
        id AS version_id,
        resume_id,
        version_number AS latest_version_number,
        ats_score AS latest_ats_score,
        created_at AS last_updated_at
    FROM resume_versions
    ORDER BY resume_id, version_number DESC, created_at DESC
)
SELECT 
    u.id AS user_id,
    u.email,
    ga.github_username,
    lr.resume_id,
    lr.original_filename,
    COALESCE(lv.latest_version_number, 0) AS latest_version_number,
    COALESCE(lv.latest_ats_score, 0) AS latest_ats_score,
    COALESCE(lv.last_updated_at, lr.uploaded_at, u.created_at) AS last_updated_at
FROM users u
LEFT JOIN github_accounts ga ON ga.user_id = u.id
LEFT JOIN latest_resumes lr ON lr.user_id = u.id
LEFT JOIN latest_versions lv ON lv.resume_id = lr.resume_id;


-- 3. View 2: v_resume_version_details / v_resume_version_history
-- Pre-joins version details, resume metadata, and user info for instantaneous version timeline queries.
CREATE OR REPLACE VIEW v_resume_version_details AS
SELECT 
    rv.id AS version_id,
    rv.resume_id,
    r.user_id,
    u.email,
    r.original_filename,
    rv.version_number,
    rv.file_path,
    rv.ats_score,
    rv.created_at AS generated_at
FROM resume_versions rv
JOIN resumes r ON r.id = rv.resume_id
JOIN users u ON u.id = r.user_id
ORDER BY rv.created_at DESC;

-- Backward compatibility alias
CREATE OR REPLACE VIEW v_resume_version_history AS
SELECT * FROM v_resume_version_details;


-- ========== backend/db/migrations/002_add_suggestions.sql ==========

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


-- ========== backend/db/migrations/003_add_jd_and_archives.sql ==========

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


-- ========== backend/db/migrations/004_add_updated_at_trigger.sql ==========

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
