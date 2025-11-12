# Security Documentation

## Token Storage Security

### Current Implementation: localStorage

The application currently stores JWT tokens in `localStorage`. This approach has security implications that should be understood:

#### Security Considerations

1. **XSS Vulnerability**: Tokens stored in localStorage are accessible to any JavaScript running on the page, making them vulnerable to Cross-Site Scripting (XSS) attacks.

2. **Mitigation Measures Implemented**:
   - Content Security Policy (CSP) headers to prevent XSS
   - Input sanitization on all user inputs
   - Token blacklisting on logout
   - Token rotation on refresh
   - Secure token expiration (24h access, 7d refresh)

3. **Best Practices Followed**:
   - Tokens are never logged or exposed in error messages
   - Tokens are blacklisted immediately on logout
   - Refresh tokens are rotated on each use
   - Short token expiration times

#### Recommended Improvements for Production

For enhanced security in production, consider:

1. **httpOnly Cookies** (Recommended):
   - Store tokens in httpOnly cookies instead of localStorage
   - Cookies are not accessible to JavaScript, preventing XSS token theft
   - Requires backend changes to set cookies with SameSite=Strict
   - Implementation: Modify auth routes to set httpOnly cookies

2. **Secure Token Storage with Encryption**:
   - Encrypt tokens before storing in localStorage
   - Use Web Crypto API for client-side encryption
   - Decrypt on each API request

3. **Token Storage Alternatives**:
   - Use sessionStorage (cleared on tab close)
   - Use IndexedDB with encryption
   - Use secure, httpOnly cookies (best option)

#### Implementation Notes

- The current localStorage implementation is acceptable for development and low-risk applications
- For high-security applications handling sensitive financial data, httpOnly cookies are strongly recommended
- All tokens are properly blacklisted on logout to prevent reuse
- Token rotation prevents token reuse attacks

## Security Features Implemented

### Authentication & Authorization
- JWT token-based authentication with validation
- Token blacklisting on logout
- Refresh token rotation
- Account lockout after failed attempts
- Role-based access control (RBAC)

### Input Validation & Sanitization
- Comprehensive input validation using express-validator
- Input sanitization to prevent XSS
- SQL injection prevention through Sequelize ORM
- Search input sanitization for LIKE queries

### Rate Limiting
- General API rate limiting
- Stricter limits on authentication endpoints
- Payment endpoint rate limiting
- Violation search rate limiting

### CSRF Protection
- CSRF token validation for state-changing requests
- Token rotation on use
- SameSite cookie support ready

### Data Protection
- PII redaction in logs
- Sensitive data sanitization in error messages
- Secure password hashing (bcrypt, 12 rounds)
- Password reset token expiration (30 minutes)

### Network Security
- HTTPS enforcement in production
- HSTS headers
- Secure CORS configuration
- Security headers via Helmet.js

### File Upload Security
- File type validation
- File size limits
- Filename sanitization
- Path traversal prevention

### Audit & Monitoring
- Request ID tracking
- Audit logging for sensitive operations
- Security incident tracing

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use strong, unique secrets.
2. **JWT Secrets**: Must be at least 32 characters. Generate using: `openssl rand -base64 32`
3. **HTTPS**: Always use HTTPS in production. Set `FORCE_HTTPS=true`.
4. **CORS**: Restrict CORS origins to specific domains only.
5. **Rate Limiting**: Adjust limits based on expected traffic.
6. **Logging**: Review logs regularly for security incidents.
7. **Updates**: Keep dependencies updated and scan for vulnerabilities.

## Reporting Security Issues

See `.well-known/security.txt` for responsible disclosure policy.

## Dependency Vulnerability Scanning

### Automated Scanning

Run dependency audits regularly:

```bash
# Scan backend dependencies
npm audit

# Scan frontend dependencies
cd frontend && npm audit

# Scan all dependencies
npm run audit:all

# Fix automatically fixable issues
npm audit fix
```

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run security audit
  run: npm run audit:all
```

### Recommended Tools

1. **npm audit**: Built-in Node.js dependency scanner
2. **Dependabot**: GitHub's automated dependency updater
3. **Snyk**: Comprehensive security scanning
4. **OWASP Dependency-Check**: Open-source dependency scanner

### Best Practices

- Run `npm audit` before each deployment
- Review and update dependencies monthly
- Use `npm audit fix` for automatically fixable issues
- Test thoroughly after dependency updates
- Monitor security advisories for critical packages

## Security Checklist for Production Deployment

- [ ] Change all default passwords and secrets
- [ ] Set `NODE_ENV=production`
- [ ] Set `FORCE_HTTPS=true`
- [ ] Configure proper CORS origins
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Enable database SSL with proper certificates
- [ ] Configure payment gateway credentials
- [ ] Set up log monitoring and alerting
- [ ] Review and test all security features
- [ ] Perform security audit
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Set up regular dependency scanning (weekly/monthly)

