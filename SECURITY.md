# Security Guide for RecipeMagic

This document outlines security best practices for RecipeMagic development and deployment.

## 🔐 API Key Security

### ⚠️ Critical Security Notice

**NEVER commit real API keys to version control!** API keys are sensitive credentials that can be misused if exposed.

### 🔑 API Key Management

#### Development Setup
1. **Environment Variables (Recommended)**:
   ```bash
   # Create .env file (already in .gitignore)
   GROQ_API_KEY=your_actual_groq_key
   YOUTUBE_API_KEY=your_actual_youtube_key
   ```

2. **Local Development**:
   - Use `.env.local` for personal development
   - Add `.env.local` to `.gitignore`
   - Never share `.env` files

#### Production Deployment
1. **Environment Variables**:
   ```bash
   # Set in hosting environment
   export GROQ_API_KEY=your_production_key
   export YOUTUBE_API_KEY=your_production_key
   ```

2. **Platform-Specific**:
   - **Netlify**: Environment variables in site settings
   - **Vercel**: Environment variables in project settings
   - **Heroku**: Config vars in app settings
   - **AWS**: Parameter Store or Secrets Manager

### 🛡️ Security Best Practices

#### API Key Storage
- ✅ **DO**: Use environment variables
- ✅ **DO**: Use secret management services
- ✅ **DO**: Rotate keys regularly
- ❌ **DON'T**: Hard-code keys in source code
- ❌ **DON'T**: Commit keys to Git
- ❌ **DON'T**: Share keys in public repositories

#### Code Security
```javascript
// ❌ BAD - Hardcoded keys
const GROQ_API_KEY = 'gsk_actual_key_here';

// ✅ GOOD - Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'fallback_key';

// ✅ GOOD - With validation
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required');
}
```

#### Git Security
```bash
# Check if keys are accidentally committed
git log --all --full-history --source --all | grep -i "key\|secret\|password"

# Remove sensitive data from history if needed
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch filename_with_keys'
```

### 🔍 Security Monitoring

#### Regular Checks
1. **API Usage Monitoring**:
   - Monitor GROQ API usage for unusual patterns
   - Check YouTube API quota consumption
   - Set up usage alerts

2. **Git History Security**:
   ```bash
   # Scan for potential secrets in commits
   git secrets --scan
   ```

3. **Dependency Security**:
   ```bash
   # Check for vulnerabilities
   npm audit
   yarn audit
   ```

### 🚨 Incident Response

#### If API Keys Are Exposed
1. **Immediate Actions**:
   - Revoke exposed keys immediately
   - Generate new API keys
   - Update all environment variables

2. **Git Cleanup**:
   ```bash
   # Remove sensitive data from history
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch sensitive_file'
   git push origin --force --all
   ```

3. **Password Rotation**:
   - Change all related passwords
   - Review access logs
   - Enable two-factor authentication

### 🔒 Additional Security Measures

#### Application Security
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **HTTPS Only**: Enforce secure connections
- **Content Security Policy**: Implement CSP headers

#### Infrastructure Security
- **Firewall Rules**: Restrict API access
- **VPN/SSH**: Secure server access
- **Regular Updates**: Keep dependencies patched
- **Access Logs**: Monitor and review logs

### 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **Private Disclosure**:
   - Email - security@recipe-finder.com
   - Include detailed description
   - Provide reproduction steps
   - Allow reasonable time to fix

2. **Public Disclosure**:
   - Wait for patch release
   - Follow responsible disclosure
   - Credit researchers appropriately

### 🔧 Security Configuration

#### Environment Setup
```bash
# Development environment
NODE_ENV=development
DEBUG=false

# Production environment
NODE_ENV=production
DEBUG=false
```

#### API Security Headers
```javascript
// Add to your server if using backend
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.groq.com", "https://www.googleapis.com"]
        }
    }
}));
```

### 📚 Security Resources

- [OWASP Web Security](https://owasp.org/)
- [Node Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Git Security](https://git-scm.com/book/en/v2/Git-Tools-Security.html)
- [API Security Guidelines](https://owasp.org/www-project-api-security)

---

## 🚨 Important Reminders

1. **Never commit API keys** to any public repository
2. **Always use environment variables** for sensitive data
3. **Regularly rotate** your API keys
4. **Monitor API usage** for unusual activity
5. **Keep dependencies** updated and secure

**Security is everyone's responsibility!** 🛡️
