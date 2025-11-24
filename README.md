# Freelance Management System

A full-stack project management application for freelancers built with React, Node.js, and SQL Server.

## Features

- User authentication and authorization
- Client management
- Project tracking
- Task management with calendar view
- Invoice generation
- Time tracking
- Real-time notifications
- Dashboard with analytics
- File management
- Reports generation

## Tech Stack

**Frontend:**
- React 18
- Vite
- Material-UI
- Axios
- Socket.io Client

**Backend:**
- Node.js
- Express
- SQL Server / Azure SQL
- JWT Authentication
- Socket.io
- Bcrypt

## Quick Start

### Prerequisites
- Node.js 16+
- SQL Server Express (local) or Azure SQL (production)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ahmedmhosni/freelance.git
cd freelance
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# For local SQL Server
USE_AZURE_SQL=true
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=FreelancerDB
DB_USER=your-username
DB_PASSWORD=your-password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# For Azure SQL (production)
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database
AZURE_SQL_USER=your-username@your-server
AZURE_SQL_PASSWORD="your-password"
AZURE_SQL_PORT=1433
AZURE_SQL_ENCRYPT=true
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. Setup database

Run the schema script on your SQL Server:
```bash
# Using sqlcmd
sqlcmd -S your-server -d your-database -i backend/src/db/schema-azure.sql

# Or use Azure Data Studio / SQL Server Management Studio
```

5. Seed initial data
```bash
cd backend
node src/db/seed.js
```

6. Start the application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Credentials

After seeding:
- **Admin**: admin@example.com / admin123
- **Freelancer**: freelancer@example.com / freelancer123

## Deployment

### Azure Deployment

The app is configured for Azure deployment:
- Frontend: Azure Static Web Apps
- Backend: Azure Web App
- Database: Azure SQL Database

GitHub Actions automatically deploys on push to the main branch.

### Environment Variables (Azure)

Configure these in Azure Web App settings:
- `USE_AZURE_SQL=true`
- `DB_SERVER=your-azure-sql-server.database.windows.net`
- `DB_DATABASE=your-database-name`
- `DB_USER=your-username@your-server`
- `DB_PASSWORD=your-password`
- `DB_ENCRYPT=true`
- `JWT_SECRET=your-production-secret`
- `NODE_ENV=production`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Time Tracking
- `GET /api/time-tracking` - Get time entries
- `POST /api/time-tracking/start` - Start timer
- `PUT /api/time-tracking/:id/stop` - Stop timer
- `DELETE /api/time-tracking/:id` - Delete entry

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## License

MIT

## Author

Ahmed M Hosni
