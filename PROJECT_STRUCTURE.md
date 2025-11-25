# 📁 Project Structure

## Root Directory
```
roastify/
├── backend/              # Backend Node.js/Express application
├── frontend/             # Frontend React application
├── database/             # Database scripts and migrations
├── scripts/              # Setup and test scripts
├── docs/                 # Documentation
├── deploy-scripts/       # Deployment scripts
├── .github/              # GitHub workflows
├── README.md             # Main documentation
├── PROJECT_STRUCTURE.md  # This file
└── package.json          # Root package configuration
```

## Backend Structure
```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── db/              # Database connection and queries
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── logs/                # Application logs
├── .env                 # Environment variables (local)
├── .env.example         # Environment template
├── package.json         # Backend dependencies
└── README.md            # Backend documentation
```

## Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── context/         # React Context providers
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── package.json         # Frontend dependencies
└── vite.config.js       # Vite configuration
```

## Database Structure
```
database/
├── migrations/          # Database schema and migrations
│   ├── AZURE_MANUAL_SCHEMA.sql           # Main schema
│   ├── AZURE_ADD_AUTH_TOKENS.sql         # Auth tokens migration
│   ├── AZURE_ADD_MAINTENANCE_TABLE.sql   # Maintenance table
│   ├── AZURE_ADD_QUOTES.sql              # Quotes table
│   ├── ADD_VERIFICATION_CODE_COLUMN.sql  # Verification codes
│   ├── AZURE_MISSING_TABLES.sql          # Additional tables
│   ├── AZURE_REMAINING_TABLES.sql        # Remaining tables
│   ├── AZURE_SEED_DATA.sql               # Seed data
│   └── VERIFY_QUOTES.sql                 # Verify quotes
└── indexes/             # Performance indexes
    ├── add-performance-indexes.sql       # 23 performance indexes
    └── verify-indexes.sql                # Verify indexes script
```

## Scripts Structure
```
scripts/
├── setup/               # Setup scripts
│   ├── setup-app-insights.js             # App Insights setup
│   ├── run-indexes.js                    # Apply database indexes
│   ├── setup-local-sqlserver.ps1         # Local SQL Server setup
│   └── setup-local-db.sql                # Local database setup
└── test/                # Test scripts
    ├── test-connection.js                # Test database connection
    ├── test-email-system.js              # Test email system
    └── verify-database-backups.js        # Verify backups
```

## Documentation Structure
```
docs/
├── guides/              # User guides
│   ├── APPLY_INDEXES_AZURE_PORTAL.md     # Apply indexes guide
│   ├── APPLY_INDEXES_NOW.md              # Quick index guide
│   ├── DATABASE_BACKUP_GUIDE.md          # Backup procedures
│   ├── EMAIL_SETUP_GUIDE.md              # Email configuration
│   ├── MOBILE_RESPONSIVE_GUIDE.md        # Mobile features
│   ├── RUN_INDEXES_GUIDE.md              # Index management
│   ├── AZURE_SERVICES_GUIDE.md           # Azure services
│   ├── CUSTOM_DOMAIN_EMAIL_SETUP.md      # Custom domain email
│   └── NAMECHEAP_DNS_GUIDE.md            # DNS configuration
└── setup/               # Setup documentation
    ├── SETUP_APP_INSIGHTS.md             # App Insights setup
    ├── LAUNCH_CHECKLIST.md               # Pre-launch checklist
    └── TEST_EVERYTHING.md                # Testing guide
```

## Key Files

### Configuration Files
- `.env` - Environment variables (not in git)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `package.json` - Project dependencies
- `ecosystem.config.js` - PM2 configuration
- `nixpacks.toml` - Nixpacks configuration
- `Procfile` - Process file for deployment
- `railway.json` - Railway configuration

### Documentation
- `README.md` - Main project documentation
- `PROJECT_STRUCTURE.md` - This file

### Deployment
- `.deployment` - Azure deployment configuration
- `deploy-scripts/` - Deployment automation scripts

## Important Notes

### Environment Files
- Never commit `.env` files to git
- Use `.env.example` as a template
- Different `.env` files for different environments

### Database Files
- All schema changes go in `database/migrations/`
- Performance indexes in `database/indexes/`
- Always test migrations locally first

### Scripts
- Setup scripts in `scripts/setup/`
- Test scripts in `scripts/test/`
- Make scripts executable and documented

### Documentation
- User guides in `docs/guides/`
- Setup docs in `docs/setup/`
- Keep documentation up to date

## File Naming Conventions

### SQL Files
- Schema: `AZURE_MANUAL_SCHEMA.sql`
- Migrations: `AZURE_ADD_*.sql` or `ADD_*.sql`
- Indexes: `add-performance-indexes.sql`
- Verification: `verify-*.sql`

### JavaScript Files
- Setup: `setup-*.js`
- Test: `test-*.js`
- Verification: `verify-*.js`
- Run: `run-*.js`

### Documentation
- Guides: `*_GUIDE.md`
- Setup: `SETUP_*.md`
- Status: `*_STATUS.md`
- Checklists: `*_CHECKLIST.md`

## Clean Project Checklist

- [x] All SQL scripts organized in `database/`
- [x] All setup scripts in `scripts/setup/`
- [x] All test scripts in `scripts/test/`
- [x] All documentation in `docs/`
- [x] Obsolete files removed
- [x] Clear folder structure
- [x] Proper naming conventions
- [x] Documentation updated

## Maintenance

### Adding New Features
1. Create feature branch
2. Add code to appropriate folders
3. Update documentation
4. Create migration if needed
5. Test thoroughly
6. Merge to main

### Database Changes
1. Create migration script in `database/migrations/`
2. Test locally
3. Document changes
4. Apply to production
5. Verify with verification script

### Documentation Updates
1. Update relevant guides in `docs/`
2. Update README.md if needed
3. Keep PROJECT_STRUCTURE.md current
4. Document breaking changes

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
