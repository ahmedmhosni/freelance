# Freelancer Management App

A lightweight freelancer management platform with admin oversight and cloud storage integration.

## Features
- Client & Project Management
- Task Management (Kanban, List, Calendar views)
- Invoicing & Payment Tracking
- Cloud Storage Integration (Google Drive, Dropbox, OneDrive)
- Admin Panel for User Management
- Role-based Access Control

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: SQLite (dev) / Azure SQL (prod)
- Auth: JWT + Azure AD B2C
- Storage: User cloud accounts (metadata only)

## Setup

### Install Dependencies
```bash
npm run install:all
```

### Environment Variables
Create `.env` files in both `backend/` and `frontend/` directories (see `.env.example` files).

### Run Development
```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Project Structure
```
├── backend/          # Node.js API
├── frontend/         # React SPA
└── docs/            # Documentation
```
