-- Migration 002: Add forks_count and default_branch to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS forks_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS default_branch VARCHAR(255) DEFAULT 'main' NOT NULL;
