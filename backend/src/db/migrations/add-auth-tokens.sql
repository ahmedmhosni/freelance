-- Add email verification and password reset tokens to users table

-- Add email_verified column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;

-- Add email_verification_token column
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);

-- Add email_verification_expires column
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME;

-- Add password_reset_token column
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);

-- Add password_reset_expires column
ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;

-- Create index for faster token lookups
CREATE INDEX idx_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_password_reset_token ON users(password_reset_token);
