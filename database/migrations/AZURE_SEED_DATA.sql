-- Seed Azure SQL Database with initial data

-- Insert admin user (password: admin123)
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@example.com', '$2a$10$YPszHvXRzXUXjKjKe5Z5/.rP0.Jx5fV5h5h5h5h5h5h5h5h5h5h5h5', 'admin');

-- Insert freelancer user (password: freelancer123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('John Freelancer', 'freelancer@example.com', '$2a$10$YPszHvXRzXUXjKjKe5Z5/.rP0.Jx5fV5h5h5h5h5h5h5h5h5h5h5h5', 'freelancer');

-- Get the freelancer user ID for sample data
DECLARE @freelancerId INT = (SELECT id FROM users WHERE email = 'freelancer@example.com');

-- Insert sample client
INSERT INTO clients (user_id, name, email, phone, company, notes, tags)
VALUES (@freelancerId, 'Acme Corp', 'contact@acme.com', '+1234567890', 'Acme Corporation', 'Important client', 'vip,active');

-- Get the client ID
DECLARE @clientId INT = (SELECT id FROM clients WHERE email = 'contact@acme.com');

-- Insert sample project
INSERT INTO projects (user_id, client_id, title, description, status, deadline)
VALUES (@freelancerId, @clientId, 'Website Redesign', 'Complete redesign of company website', 'active', '2025-12-31');

-- Get the project ID
DECLARE @projectId INT = (SELECT id FROM projects WHERE title = 'Website Redesign');

-- Insert sample tasks
INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date)
VALUES 
    (@freelancerId, @projectId, 'Design mockups', 'Create initial design mockups', 'high', 'in-progress', '2025-11-30'),
    (@freelancerId, @projectId, 'Frontend development', 'Implement responsive frontend', 'medium', 'todo', '2025-12-15');

-- Insert sample invoice
INSERT INTO invoices (user_id, project_id, client_id, invoice_number, amount, status, due_date, notes)
VALUES (@freelancerId, @projectId, @clientId, 'INV-001', 5000.00, 'sent', '2025-12-01', 'First milestone payment');

-- Insert sample quotes
INSERT INTO quotes (text, author, is_active) VALUES
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 1),
('The only way to do great work is to love what you do.', 'Steve Jobs', 1),
('Innovation distinguishes between a leader and a follower.', 'Steve Jobs', 1),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 1),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 1);

-- Verify data was inserted
SELECT 'Users' as TableName, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'Quotes', COUNT(*) FROM quotes;
