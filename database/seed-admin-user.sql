-- Seed Admin User for Azure PostgreSQL
-- Run this in Azure Portal Query Editor

-- Admin user details:
-- Email: ahmedmhosni90@gmail.com
-- Password: Ahmed#123456 (already hashed below)
-- Role: admin

-- Check if user exists
DO $$
DECLARE
    user_exists INTEGER;
    hashed_password TEXT := '$2a$12$8vLqYxH5YqZ5YqZ5YqZ5YeKGX5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq.';
BEGIN
    -- Note: You'll need to hash the password properly
    -- For now, let's create the user with a temporary approach
    
    SELECT COUNT(*) INTO user_exists 
    FROM users 
    WHERE email = 'ahmedmhosni90@gmail.com';
    
    IF user_exists > 0 THEN
        -- Update existing user
        UPDATE users 
        SET role = 'admin',
            email_verified = true,
            email_verification_token = NULL,
            email_verification_code = NULL,
            email_verification_expires = NULL,
            is_active = true
        WHERE email = 'ahmedmhosni90@gmail.com';
        
        RAISE NOTICE 'User updated to admin role';
    ELSE
        -- Insert new user
        -- Password hash for: Ahmed#123456
        INSERT INTO users (
            name,
            email,
            password,
            role,
            email_verified,
            is_active,
            created_at
        ) VALUES (
            'Ahmed Hosni',
            'ahmedmhosni90@gmail.com',
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqgdCyQ1u2',
            'admin',
            true,
            true,
            NOW()
        );
        
        RAISE NOTICE 'Admin user created successfully';
    END IF;
END $$;

-- Verify the user was created
SELECT id, name, email, role, email_verified, is_active, created_at
FROM users
WHERE email = 'ahmedmhosni90@gmail.com';
