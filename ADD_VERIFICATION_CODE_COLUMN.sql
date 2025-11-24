-- Add verification code column to users table

-- Add email_verification_code column
ALTER TABLE users ADD email_verification_code NVARCHAR(6);

-- Create index for faster code lookups
CREATE INDEX idx_email_verification_code ON users(email_verification_code);

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME = 'email_verification_code';
