# Security Policy

## 🔐 Reporting Security Vulnerabilities

If you discover a security vulnerability in The Lucy Lounge, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email details to the repository owner
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide updates on remediation progress.

---

## 🛡️ Security Measures

### Authentication & Authorization

- **Supabase Auth**: Handles all user authentication
- **Row Level Security (RLS)**: All database tables have RLS policies enabled
- **JWT Tokens**: Short-lived tokens with automatic refresh
- **OAuth Providers**: Secure integration with Spotify, Google, etc.

### Data Protection

- **Environment Variables**: All secrets stored in environment variables, never in code
- **HTTPS Only**: All traffic encrypted via TLS
- **Input Validation**: All user inputs sanitized before processing
- **SQL Injection Prevention**: Parameterized queries via Supabase client

### API Security

- **Rate Limiting**: Edge Functions have rate limits to prevent abuse
- **CORS Configuration**: Strict origin policies for API endpoints
- **API Key Rotation**: Regular rotation of service keys

### Code Security

- **Dependency Scanning**: Regular npm audit for vulnerabilities
- **No Secrets in Code**: CI checks prevent committing secrets
- **Branch Protection**: Main branch requires PR and CI passage

---

## 📦 Dependency Management

### Automated Security

- Dependabot enabled for dependency updates
- npm audit run on every CI build
- Critical vulnerabilities block deployment

### Manual Review

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and update manually
npm outdated
```

---

## 🔑 Secrets Management

### Required Secrets

| Secret | Storage Location | Rotation Frequency |
|--------|------------------|-------------------|
| Supabase Anon Key | Vercel Env Vars | Project creation |
| Supabase Service Key | Supabase Dashboard only | As needed |
| Spotify Client Secret | Vercel Env Vars | Annually |
| AI API Keys | Vercel Env Vars | Quarterly |

### What NOT to Commit

- `.env` files
- API keys or tokens
- Database connection strings
- Private keys or certificates
- User data or PII

---

## 🚨 Incident Response

### If a Secret is Leaked

1. **Immediately rotate** the compromised credential
2. **Revoke** any active sessions using the old credential
3. **Audit** logs for unauthorized access
4. **Update** all deployment environments with new credentials
5. **Document** the incident and remediation steps

### If a Vulnerability is Exploited

1. **Contain** - Disable affected functionality if necessary
2. **Assess** - Determine scope and impact
3. **Remediate** - Deploy fix to production
4. **Notify** - Inform affected users if data was compromised
5. **Review** - Conduct post-incident analysis

---

## ✅ Security Checklist for Contributors

Before submitting a PR:

- [ ] No secrets or API keys in code
- [ ] No console.log of sensitive data
- [ ] Input validation on user-submitted data
- [ ] Error messages don't expose internal details
- [ ] New dependencies reviewed for security issues

---

## 📜 Compliance

- **GDPR**: User data deletion available on request
- **CCPA**: California consumer rights supported
- **SOC 2**: Supabase infrastructure is SOC 2 compliant

---

*Security policy last reviewed: June 2025*
