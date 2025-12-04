# ADR 003: JWT-Based Authentication

## Status

Accepted

## Context

The application requires a secure authentication mechanism that:
- Works well with RESTful APIs
- Supports stateless authentication
- Scales horizontally
- Works across different clients (web, mobile)
- Provides good security without excessive complexity

## Decision

We will use **JWT (JSON Web Tokens)** for authentication with the following implementation:

### Token Structure:

```javascript
{
  userId: 123,
  email: 'user@example.com',
  role: 'freelancer',
  iat: 1640995200,
  exp: 1641081600
}
```

### Implementation Details:

1. **Token Generation**: Generate JWT on successful login/registration
2. **Token Expiry**: 24-hour expiration
3. **Token Refresh**: Refresh endpoint for getting new tokens
4. **Token Storage**: Client-side storage (localStorage/sessionStorage)
5. **Token Validation**: Middleware validates token on protected routes
6. **Secret Management**: JWT secret stored in environment variables

### Security Measures:

- Strong JWT secret (minimum 32 characters)
- HTTPS only in production
- Token expiration (24 hours)
- Email verification before login (production)
- Password hashing with bcrypt (10 rounds)
- Rate limiting on auth endpoints

## Consequences

### Positive:

- **Stateless**: No server-side session storage required
- **Scalable**: Works well with load balancers and multiple servers
- **Cross-Platform**: Works with web, mobile, and other clients
- **Performance**: No database lookup for every request
- **Decoupled**: Frontend and backend can be deployed separately
- **Standard**: Industry-standard approach with good library support

### Negative:

- **Token Revocation**: Difficult to revoke tokens before expiry
- **Token Size**: Larger than session IDs (sent with every request)
- **Secret Management**: JWT secret must be kept secure
- **Logout**: Client-side only (token remains valid until expiry)

### Mitigation:

- Short token expiration (24 hours)
- Implement token refresh mechanism
- Use token blacklist for critical revocations (future enhancement)
- Secure secret management with environment variables
- Implement proper logout on client side

## Alternatives Considered

### 1. Session-Based Authentication

**Pros**: Easy to revoke, smaller cookies, familiar pattern
**Cons**: Requires server-side storage, doesn't scale horizontally well, sticky sessions needed

### 2. OAuth 2.0

**Pros**: Industry standard, supports third-party auth
**Cons**: Complex to implement, overkill for simple use case

### 3. API Keys

**Pros**: Simple, long-lived
**Cons**: No expiration, difficult to rotate, less secure

### 4. Passport.js with Multiple Strategies

**Pros**: Flexible, supports many auth methods
**Cons**: Additional dependency, more complex than needed

## Token Lifecycle

```
1. User Login
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT
   ↓
4. Client stores JWT
   ↓
5. Client sends JWT with each request
   ↓
6. Server validates JWT
   ↓
7. Server processes request
   ↓
8. Token expires after 24 hours
   ↓
9. Client refreshes token or re-authenticates
```

## Security Best Practices

### Password Requirements:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Validation:

```javascript
// Middleware validates:
1. Token exists
2. Token is valid (signature)
3. Token is not expired
4. User still exists
5. User email is verified
```

### Rate Limiting:

- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Refresh: 10 attempts per hour

## Future Enhancements

1. **Refresh Tokens**: Separate long-lived refresh tokens
2. **Token Blacklist**: Redis-based blacklist for revoked tokens
3. **Multi-Factor Authentication**: SMS/TOTP for additional security
4. **Social Login**: OAuth integration with Google, GitHub, etc.
5. **Device Tracking**: Track and manage logged-in devices

## References

- [JWT.io](https://jwt.io/)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
