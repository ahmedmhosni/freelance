-- Drop all tables in correct order (respecting foreign keys)
-- Run this to start fresh

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS file_metadata;
DROP TABLE IF EXISTS time_entries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;
