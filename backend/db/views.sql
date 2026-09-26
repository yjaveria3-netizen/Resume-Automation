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
