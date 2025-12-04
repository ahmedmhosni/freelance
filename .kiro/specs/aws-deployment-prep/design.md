# Design Document: AWS Production Deployment Preparation

## Overview

This design outlines the implementation of production-ready features for deploying the Roastify application to AWS. The solution includes build automation, deployment scripts, enhanced monitoring, database migrations, and AWS-specific configurations to ensure reliable, secure, and scalable operation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Workflow                     │
│                                                          │
│  1. Code Changes → 2. Build → 3. Test → 4. Deploy      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Build System                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │  Validation  │ │
│  │    Build     │  │     Prep     │  │    Tests     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Deployment Pipeline                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Transfer    │  │  Migrations  │  │   Health     │ │
│  │   to EC2     │  │    Apply     │  │   Check      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   AWS Infrastructure                     │
│                                                          │
│  ALB → EC2 (App) → RDS (PostgreSQL) → S3 (Files)       │
│         │                                                │
│         └─→ CloudWatch (Logs & Metrics)                 │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction

1. **Build System**: Compiles and optimizes code for production
2. **Migration System**: Manages database schema versions
3. **Deployment Scripts**: Automates transfer and startup on EC2
4. **Health Monitoring**: Provides status checks for AWS ALB
5. **Logging System**: Sends structured logs to CloudWatch

## Components and Interfaces

### 1. Build System

**Purpose**: Create optimized production artifacts

**Components**:
- Frontend build (Vite)
- Backend dependency installation
- Build verification

**Interface**:
```bash
# Root package.json scripts
npm run build              # Build everything
npm run build:frontend     # Build frontend only
npm run build:backend      # Prepare backend only
npm run verify:build       # Verify build artifacts
```

### 2. Database Migration System

**Purpose**: Manage database schema changes

**Components**:
- Migration runner
- Migration tracker table
- Migration scripts directory

**Interface**:
```javascript
// backend/src/db/migrate.js
class MigrationRunner {
  async run() {
    // Get applied migrations
    // Find pending migrations
    // Execute in order
    // Track completion
  }
  
  async rollback(steps = 1) {
    // Rollback last N migrations
  }
}
```

**Database Schema**:
```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Enhanced Health Check

**Purpose**: Provide comprehensive application status

**Endpoint**: `GET /health`

**Response Format**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-12-04T10:30:00Z",
  "version": "1.0.1",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "memory": {
      "used": 256,
      "total": 512,
      "percentage": 50
    }
  }
}
```

### 4. Deployment Scripts

**Purpose**: Automate deployment to AWS EC2

**Scripts**:
- `scripts/deploy.sh` - Main deployment script
- `scripts/setup-ec2.sh` - Initial EC2 setup
- `scripts/rollback.sh` - Rollback to previous version

**Deployment Flow**:
```
1. Build locally
2. Run tests
3. Transfer to EC2
4. Backup current version
5. Run migrations
6. Start new version
7. Health check
8. Switch traffic
```

### 5. Environment Configuration

**Purpose**: Manage environment-specific settings

**Files**:
- `backend/.env.production.example` - Production template
- `backend/.env.aws.example` - AWS-specific template
- `scripts/validate-env.js` - Environment validator

**Required Variables**:
```bash
# Application
NODE_ENV=production
PORT=5000
APP_URL=https://roastify.online

# Database (AWS RDS)
PG_HOST=roastify-db.xxxxx.us-east-1.rds.amazonaws.com
PG_PORT=5432
PG_DATABASE=roastify
PG_USER=roastify_admin
PG_PASSWORD=<secure-password>
PG_SSL=true

# JWT
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET=roastify-storage

# Email (if using AWS SES instead of Azure)
EMAIL_FROM=noreply@roastify.online
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<ses-user>
SMTP_PASS=<ses-password>

# Monitoring
CLOUDWATCH_LOG_GROUP=/aws/ec2/roastify
CLOUDWATCH_LOG_STREAM=application
```

## Data Models

### Migration Record

```javascript
{
  id: 1,
  version: "001",
  name: "initial_schema",
  applied_at: "2024-12-04T10:00:00Z"
}
```

### Health Check Response

```javascript
{
  status: "healthy",
  timestamp: "2024-12-04T10:30:00Z",
  version: "1.0.1",
  uptime: 3600,
  checks: {
    database: {
      status: "healthy",
      responseTime: 15
    },
    memory: {
      used: 256,
      total: 512,
      percentage: 50
    }
  }
}
```

### Deployment Metadata

```javascript
{
  version: "1.0.1",
  deployedAt: "2024-12-04T10:00:00Z",
  deployedBy: "github-actions",
  commit: "abc123",
  previousVersion: "1.0.0"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Build Completeness
*For any* successful build execution, all required output files (frontend dist directory and backend node_modules) must exist
**Validates: Requirements 1.1, 1.5**

### Property 2: Migration Idempotency
*For any* migration that has been applied, running the migration system again should not re-apply that migration
**Validates: Requirements 3.1, 3.2**

### Property 3: Migration Ordering
*For any* set of pending migrations, they must be applied in sequential version order
**Validates: Requirements 3.2**

### Property 4: Health Check Response Time
*For any* health check request, the response must be returned within 2 seconds
**Validates: Requirements 4.4**

### Property 5: Health Check Database Verification
*For any* health check execution, if the database is unreachable, the status must be "unhealthy" with HTTP 503
**Validates: Requirements 4.1, 4.5**

### Property 6: Environment Variable Validation
*For any* application startup, if required environment variables are missing, the application must fail to start with a clear error message
**Validates: Requirements 2.4**

### Property 7: Log Sanitization
*For any* log entry, it must not contain sensitive data such as passwords, tokens, or credit card numbers
**Validates: Requirements 5.4**

### Property 8: Static Asset Caching
*For any* static asset with a hash in the filename, the cache header must specify a long expiration time (1 year)
**Validates: Requirements 6.3**

### Property 9: Security Headers Presence
*For any* HTTP response in production mode, all required security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) must be present
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 10: Rate Limiting IP Detection
*For any* request behind a proxy, the rate limiter must use the X-Forwarded-For header to identify the real client IP
**Validates: Requirements 13.1, 13.2**

### Property 11: Deployment Health Check
*For any* deployment, if the health check fails after deployment, the deployment must be marked as failed
**Validates: Requirements 11.4**

### Property 12: Build Artifact Integrity
*For any* production build, the generated JavaScript bundles must be minified and have unique hashes in filenames
**Validates: Requirements 1.2, 6.5**

## Error Handling

### Build Errors

**Scenario**: Frontend build fails
**Handling**: 
- Exit with non-zero code
- Display clear error message
- Preserve previous build if exists

**Scenario**: Backend dependency installation fails
**Handling**:
- Exit with non-zero code
- Log npm error output
- Suggest checking package.json

### Migration Errors

**Scenario**: Migration SQL syntax error
**Handling**:
- Halt migration process
- Do not mark migration as applied
- Log full error with migration file name
- Rollback transaction if in progress

**Scenario**: Database connection fails during migration
**Handling**:
- Retry connection 3 times with exponential backoff
- If still failing, exit with error
- Log connection details (without password)

### Deployment Errors

**Scenario**: Health check fails after deployment
**Handling**:
- Keep previous version running
- Log health check failure details
- Mark deployment as failed
- Send alert notification

**Scenario**: File transfer to EC2 fails
**Handling**:
- Retry transfer up to 3 times
- If still failing, abort deployment
- Log transfer error details

### Runtime Errors

**Scenario**: Database connection lost during operation
**Handling**:
- Attempt reconnection with exponential backoff
- Return 503 Service Unavailable to clients
- Log connection loss event
- Update health check status to unhealthy

**Scenario**: Memory usage exceeds 90%
**Handling**:
- Log warning with memory stats
- Trigger garbage collection if possible
- Update health check to degraded status
- Send alert if sustained for > 5 minutes

## Testing Strategy

### Unit Tests

**Build System**:
- Test build script execution
- Test build artifact verification
- Test error handling for missing dependencies

**Migration System**:
- Test migration tracking
- Test migration ordering
- Test rollback functionality
- Test error handling for failed migrations

**Health Check**:
- Test response format
- Test database connectivity check
- Test memory reporting
- Test response time

**Environment Validation**:
- Test missing variable detection
- Test invalid format detection
- Test error message clarity

### Integration Tests

**Deployment Flow**:
- Test full deployment process in staging
- Test rollback process
- Test migration application during deployment
- Test health check verification

**Database Migrations**:
- Test migrations against real PostgreSQL
- Test migration rollback
- Test migration on fresh database

### End-to-End Tests

**Production Build**:
- Build application locally
- Start application with production build
- Verify all endpoints respond correctly
- Verify static assets are served with correct headers

**AWS Integration**:
- Deploy to test EC2 instance
- Verify ALB health checks pass
- Verify CloudWatch logs are received
- Verify WebSocket connections work through ALB

### Performance Tests

**Health Check**:
- Verify response time < 2 seconds under load
- Test with database latency
- Test with high memory usage

**Static Asset Serving**:
- Verify gzip compression is applied
- Verify cache headers are correct
- Measure page load times

## Implementation Notes

### Frontend Build Optimization

Use Vite's built-in optimizations:
- Code splitting for vendor libraries
- Tree shaking for unused code
- Minification with terser
- Asset hashing for cache busting

### Database Migration Best Practices

- Use transactions for each migration
- Include both up and down migrations
- Test migrations on copy of production data
- Keep migrations small and focused
- Never modify applied migrations

### AWS-Specific Considerations

**EC2 Instance**:
- Use Amazon Linux 2023 AMI
- Install Node.js 18 LTS
- Configure PM2 for process management
- Set up log rotation

**RDS PostgreSQL**:
- Enable automated backups
- Set backup retention to 30 days
- Enable encryption at rest
- Use SSL for connections

**Application Load Balancer**:
- Configure health check path: `/health`
- Set health check interval: 30 seconds
- Set healthy threshold: 2
- Set unhealthy threshold: 3
- Enable sticky sessions for WebSockets

**CloudWatch**:
- Create log group: `/aws/ec2/roastify`
- Set log retention: 30 days
- Create alarms for error rate
- Create alarms for response time

### Security Considerations

**Environment Variables**:
- Never commit .env files
- Use AWS Systems Manager Parameter Store for secrets (future enhancement)
- Rotate JWT_SECRET periodically
- Use strong database passwords (20+ characters)

**HTTPS**:
- Enforce HTTPS redirect
- Use TLS 1.2 or higher
- Configure HSTS with long max-age

**Rate Limiting**:
- Trust proxy headers from ALB
- Use Redis for distributed rate limiting (future enhancement)
- Apply stricter limits to auth endpoints

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Production build successful
- [ ] Environment variables documented
- [ ] Database backup created
- [ ] Deployment plan reviewed

### Deployment

- [ ] Build application
- [ ] Transfer to EC2
- [ ] Run migrations
- [ ] Start application
- [ ] Health check passes
- [ ] Smoke tests pass

### Post-Deployment

- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Verify user functionality
- [ ] Check CloudWatch logs
- [ ] Update deployment documentation

## Future Enhancements

1. **CI/CD Pipeline**: GitHub Actions for automated deployment
2. **Blue-Green Deployment**: Zero-downtime deployments
3. **Container Support**: Docker images for easier deployment
4. **Infrastructure as Code**: Terraform for AWS resources
5. **Secrets Management**: AWS Secrets Manager integration
6. **Distributed Caching**: Redis for session and cache storage
7. **CDN Integration**: CloudFront for static assets
8. **Auto-Scaling**: EC2 Auto Scaling based on load
9. **Database Read Replicas**: For improved read performance
10. **Monitoring Dashboard**: Custom dashboard for key metrics
