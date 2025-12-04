# ADR 002: PostgreSQL Over SQLite

## Status

Accepted

## Context

The original application used SQLite for data storage. While SQLite is excellent for development and small applications, we needed to evaluate whether it was suitable for production use as the application scales.

### Requirements:

- Support for concurrent users
- ACID compliance
- Advanced query capabilities
- Scalability for production workloads
- Support for read replicas
- Better performance for complex queries
- Cloud deployment compatibility (AWS RDS)

## Decision

We will migrate from **SQLite to PostgreSQL** as the primary database.

### Implementation Details:

1. **Connection Pooling**: Use `pg` library with connection pooling (max 20 connections)
2. **Transaction Support**: Implement proper transaction handling with rollback
3. **Parameterized Queries**: Use parameterized queries for security
4. **Migration Path**: Support both local PostgreSQL and AWS RDS
5. **Test Database**: Separate test database for isolation

## Consequences

### Positive:

- **Concurrency**: PostgreSQL handles concurrent connections much better than SQLite
- **Performance**: Better performance for complex queries and large datasets
- **Features**: Advanced features like JSON columns, full-text search, window functions
- **Scalability**: Can scale vertically and horizontally with read replicas
- **Production Ready**: Battle-tested for production workloads
- **Cloud Support**: Native support in AWS RDS, Azure Database, Google Cloud SQL
- **ACID Compliance**: Full ACID compliance with proper transaction isolation
- **Backup/Recovery**: Better backup and point-in-time recovery options

### Negative:

- **Setup Complexity**: Requires PostgreSQL installation for local development
- **Resource Usage**: Higher memory and CPU usage compared to SQLite
- **Cost**: Cloud-hosted PostgreSQL has ongoing costs
- **Migration Effort**: Need to migrate existing SQLite data

### Mitigation:

- Provide clear setup instructions for local PostgreSQL
- Use Docker for consistent development environment
- Implement connection pooling to optimize resource usage
- Create migration scripts for data transfer

## Alternatives Considered

### 1. Keep SQLite

**Pros**: Simple, no setup, file-based
**Cons**: Poor concurrency, limited scalability, not production-ready for multi-user apps

### 2. MySQL

**Pros**: Popular, well-documented, good performance
**Cons**: Less advanced features than PostgreSQL, licensing concerns (Oracle)

### 3. MongoDB

**Pros**: Flexible schema, horizontal scaling
**Cons**: No ACID transactions (older versions), different query paradigm, overkill for relational data

### 4. Amazon Aurora

**Pros**: AWS-native, auto-scaling, high performance
**Cons**: Vendor lock-in, higher cost, PostgreSQL-compatible anyway

## Migration Strategy

1. **Phase 1**: Set up PostgreSQL locally and in test environment
2. **Phase 2**: Update database layer to support PostgreSQL
3. **Phase 3**: Run both databases in parallel during transition
4. **Phase 4**: Migrate data from SQLite to PostgreSQL
5. **Phase 5**: Switch to PostgreSQL as primary database
6. **Phase 6**: Remove SQLite dependencies

## Performance Considerations

### Connection Pooling Configuration:

```javascript
{
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000
}
```

### Indexing Strategy:

- Primary keys on all tables
- Foreign key indexes for joins
- Indexes on frequently queried columns (user_id, status, created_at)
- Composite indexes for common query patterns

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL vs SQLite](https://www.sqlite.org/whentouse.html)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)
- [Node.js pg Library](https://node-postgres.com/)
