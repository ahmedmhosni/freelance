-- Database Migration Script
-- Generated: 2025-11-28T16:22:58.205Z
-- This script will sync production database with local schema

-- ==========================================
-- Missing Columns
-- ==========================================

-- Add column: activity_logs.user_agent
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add column: users.last_login_at
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITHOUT TIME ZONE;

-- Add column: users.last_activity_at
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITHOUT TIME ZONE;

-- Add column: users.login_count
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add column: users.last_login_ip
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip CHARACTER VARYING;

