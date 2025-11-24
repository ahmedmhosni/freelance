-- Azure SQL: Add email verification and password reset tokens to users table

-- Add email_verified column
ALTER TABLE users ADD email_verified BIT DEFAULT 0;

-- Add email_verification_token column
ALTER TABLE users ADD email_verification_token NVARCHAR(255);

-- Add email_verification_expires column
ALTER TABLE users ADD email_verification_expires DATETIME2;

-- Add password_reset_token column
ALTER TABLE users ADD password_reset_token NVARCHAR(255);

-- Add password_reset_expires column
ALTER TABLE users ADD password_reset_expires DATETIME2;

-- Create indexes for faster token lookups
CREATE INDEX idx_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_password_reset_token ON users(password_reset_token);

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'password_reset_token', 'password_reset_expires');
