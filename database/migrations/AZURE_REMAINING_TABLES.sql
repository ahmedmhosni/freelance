-- Create remaining tables (users already exists)

-- Clients table
CREATE TABLE clients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    phone NVARCHAR(50),
    company NVARCHAR(255),
    notes NVARCHAR(MAX),
    tags NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Projects table
CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    client_id INT FOREIGN KEY REFERENCES clients(id) ON DELETE NO ACTION,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'active',
    deadline DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Tasks table
CREATE TABLE tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    priority NVARCHAR(50) DEFAULT 'medium',
    status NVARCHAR(50) DEFAULT 'todo',
    due_date DATE,
    comments NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Invoices table
CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id) ON DELETE NO ACTION,
    invoice_number NVARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'draft',
    due_date DATE,
    sent_date DATE,
    paid_date DATE,
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Time entries table
CREATE TABLE time_entries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    task_id INT FOREIGN KEY REFERENCES tasks(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    description NVARCHAR(MAX),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration DECIMAL(10, 2),
    is_running BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- File metadata table
CREATE TABLE file_metadata (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    file_name NVARCHAR(255) NOT NULL,
    cloud_provider NVARCHAR(50) NOT NULL,
    file_link NVARCHAR(500) NOT NULL,
    file_size INT,
    mime_type NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    action NVARCHAR(255) NOT NULL,
    entity_type NVARCHAR(50),
    entity_id INT,
    details NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Daily quotes table
CREATE TABLE quotes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    text NVARCHAR(MAX) NOT NULL,
    author NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_file_metadata_user_id ON file_metadata(user_id);
