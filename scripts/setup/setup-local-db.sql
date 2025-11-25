-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FreelancerDB')
BEGIN
    CREATE DATABASE FreelancerDB;
    PRINT 'Database FreelancerDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database FreelancerDB already exists';
END
GO

USE FreelancerDB;
GO

PRINT 'Switched to FreelancerDB database';
PRINT 'Run the schema.sql file next to create tables';
