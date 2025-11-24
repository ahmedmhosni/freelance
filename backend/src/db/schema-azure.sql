-- Azure SQL Database Schema
-- Project Management System

-- Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) DEFAULT 'user',
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Clients table
CREATE TABLE clients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    phone NVARCHAR(50),
    company NVARCHAR(255),
    address NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Projects table
CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    client_id INT FOREIGN KEY REFERENCES clients(id) ON DELETE SET NULL,
    status NVARCHAR(50) DEFAULT 'active',
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tasks table
CREATE TABLE tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INT FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL,
    status NVARCHAR(50) DEFAULT 'todo',
    priority NVARCHAR(50) DEFAULT 'medium',
    due_date DATE,
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Invoices table
CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_number NVARCHAR(50) UNIQUE NOT NULL,
    client_id INT FOREIGN KEY REFERENCES clients(id) ON DELETE CASCADE,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    notes NVARCHAR(MAX),
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Invoice items table
CREATE TABLE invoice_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT FOREIGN KEY REFERENCES invoices(id) ON DELETE CASCADE,
    description NVARCHAR(MAX) NOT NULL,
    quantity INT DEFAULT 1,
    rate DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

-- Files table
CREATE TABLE files (
    id INT IDENTITY(1,1) PRIMARY KEY,
    filename NVARCHAR(255) NOT NULL,
    original_name NVARCHAR(255) NOT NULL,
    mime_type NVARCHAR(100),
    size INT,
    path NVARCHAR(500) NOT NULL,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) DEFAULT 'info',
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Time entries table
CREATE TABLE time_entries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    task_id INT FOREIGN KEY REFERENCES tasks(id) ON DELETE NO ACTION,
    description NVARCHAR(MAX),
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2,
    duration INT,
    is_billable BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Quotes table
CREATE TABLE quotes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    text NVARCHAR(MAX) NOT NULL,
    author NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);

-- Maintenance page content table
CREATE TABLE maintenance_content (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(500) NOT NULL DEFAULT 'Brilliant ideas take time to be roasted',
    subtitle NVARCHAR(500) NOT NULL DEFAULT 'Roastify is coming soon',
    message NVARCHAR(MAX) NOT NULL DEFAULT 'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
    launch_date DATE NULL,
    is_active BIT DEFAULT 0,
    updated_by INT FOREIGN KEY REFERENCES users(id),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Insert default maintenance content
INSERT INTO maintenance_content (title, subtitle, message, is_active)
VALUES (
    'Brilliant ideas take time to be roasted',
    'Roastify is coming soon',
    'We''re crafting something extraordinary. Great things take time, and we''re roasting the perfect experience for you.',
    0
);
