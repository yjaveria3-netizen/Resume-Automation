-- Migration 001: Initial Schema Definition

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS github_accounts (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(255) UNIQUE NOT NULL,
    github_user_id VARCHAR(255) NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_github_accounts_username ON github_accounts (github_username);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_name VARCHAR(255) NOT NULL,
    description TEXT,
    html_url TEXT,
    language VARCHAR(100),
    tech_stack JSON,
    stars INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0 NOT NULL,
    default_branch VARCHAR(255) DEFAULT 'main' NOT NULL,
    rank_score DOUBLE PRECISION DEFAULT 0.0,
    pushed_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uix_user_repo_name UNIQUE (user_id, github_repo_name)
);
CREATE INDEX IF NOT EXISTS ix_projects_user_id ON projects (user_id);
CREATE INDEX IF NOT EXISTS ix_projects_repo_name ON projects (github_repo_name);

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    ats_score INTEGER DEFAULT 0,
    line_budget INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_resumes_user_id ON resumes (user_id);

CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    ats_score INTEGER DEFAULT 0,
    version_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_resume_versions_resume_id ON resume_versions (resume_id);

CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    user_id UUID,
    duration_ms INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_automation_logs_repo_name ON automation_logs (repo_name);
CREATE INDEX IF NOT EXISTS ix_automation_logs_user_id ON automation_logs (user_id);

CREATE TABLE IF NOT EXISTS bullet_suggestions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name VARCHAR(255) NOT NULL,
    commit_sha VARCHAR(100),
    commit_message TEXT,
    proposed_bullet TEXT NOT NULL,
    diff_summary JSON,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_bullet_suggestions_user_id ON bullet_suggestions (user_id);

CREATE TABLE IF NOT EXISTS archived_projects (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    bullet_text TEXT NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_archived_projects_resume_id ON archived_projects (resume_id);

CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    jd_text TEXT NOT NULL,
    match_score INTEGER DEFAULT 0,
    matched_keywords JSON,
    missing_keywords JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_job_descriptions_user_id ON job_descriptions (user_id);
