# Claude Development Guidelines for BeSure Project

## 🚨 CRITICAL: PRE-COMMIT CHECKLIST (MANDATORY)

⚠️ **STOP!** Before committing, you MUST:
1. ✅ Run **ALL** linting, formatting, type-check, and test commands
2. ✅ Fix **ALL ERRORS** (zero errors allowed - warnings are acceptable)
3. ✅ Verify **ALL CHECKS PASS** before creating commit

**CI/CD will REJECT commits with:**
- ❌ Any linting errors
- ❌ Any TypeScript compilation errors
- ❌ Any test failures
- ❌ Any security scan errors (secrets, credentials)
- ❌ Any build failures

**NO EXCEPTIONS - Fix errors first, then commit!**

---

### 1. Code Quality Checks (MANDATORY)

#### Backend (Node.js/TypeScript)
```bash
cd backend

# Run linter
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Check for security vulnerabilities
npm audit
```

#### Mobile (React Native/Expo)
```bash
cd mobile

# Run linter
npm run lint

# Run type checking
npm run type-check

# Check for security vulnerabilities
npm audit
```

### 2. Build Verification

#### Backend
```bash
cd backend
npm run build
```

#### Mobile
```bash
cd mobile
# Verify Expo config is valid
npx expo config --type public
```

### 3. Verification Criteria

**ALL of the following must be TRUE before committing:**

✅ **Zero linting errors** (warnings are acceptable but should be minimized)
✅ **Zero TypeScript compilation errors**
✅ **All tests passing** (100% pass rate required)
✅ **No HIGH or CRITICAL security vulnerabilities** (npm audit)
✅ **Build completes successfully** without errors
✅ **No console.log statements** in production code (use logger instead)
✅ **No hardcoded secrets or API keys**
✅ **Environment variables properly configured**

### 4. Pre-Commit Command Sequence

Run this complete sequence before every commit:

```bash
# Backend checks
cd /home/user/BeSure/backend
npm run lint && npm run type-check && npm test && npm audit && npm run build

# Mobile checks
cd /home/user/BeSure/mobile
npm run lint && npm run type-check && npm audit

# If ALL pass, proceed with commit
git add .
git commit -m "Your commit message"
git push
```

### 5. Commit Message Format

Use conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security fixes

**Examples:**
```
feat(auth): implement token refresh logic

fix(api): resolve race condition in request retry

security(client): add certificate pinning for API calls

refactor(logging): replace console statements with logger
```

## 🔒 Security Guidelines

### Never Commit:
- `.env` files (use `.env.example` instead)
- API keys, secrets, or credentials
- `node_modules/` directories
- Build artifacts (`dist/`, `build/`)
- IDE-specific files (`.vscode/`, `.idea/`)

### Always:
- Use environment variables for configuration
- Store secrets in `.env` (gitignored)
- Use SecureStore for sensitive data in mobile
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Implement proper error handling
- Log security events

## 📝 Code Style Guidelines

### TypeScript
- **No `any` types** - use proper interfaces or `unknown`
- Use `interface` for object shapes
- Use `type` for unions, intersections, or complex types
- Always define return types for functions
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefix unused parameters with underscore (`_param`)

### React Native
- Use functional components with hooks
- Extract magic numbers to constants
- Use proper TypeScript types for props
- Implement error boundaries for all routes
- Use logger instead of console statements
- Handle loading and error states

### API Client
- Always include proper error handling
- Use typed responses (`apiClient.get<ResponseType>()`)
- Implement request cancellation for unmounting components
- Use proper HTTP status codes
- Include retry logic for network errors

## 🧪 Testing Requirements

### Backend
- Unit tests for all services
- Integration tests for API endpoints
- Minimum 60% code coverage
- Test error cases and edge cases

### Mobile
- Component tests for critical UI
- Integration tests for user flows
- E2E tests for critical paths (optional but recommended)

## 📦 Dependency Management

### Adding New Dependencies
1. Check if dependency is actively maintained
2. Review security audit and CVE history
3. Verify license compatibility
4. Install exact versions (avoid `^` or `~` in production)
5. Update both `package.json` and `package-lock.json`
6. Document why dependency was added

### Updating Dependencies
1. Review changelog for breaking changes
2. Update one major dependency at a time
3. Run full test suite after update
4. Test on physical devices (mobile)
5. Update documentation if API changes

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Sentry (optional)
SENTRY_DSN=
```

#### Mobile (.env.development)
```bash
API_URL=http://localhost:3000/api/v1
EXPO_PROJECT_ID=your-expo-project-id
SENTRY_DSN=
NODE_ENV=development
```

## 🚀 Deployment Checklist

Before deploying to production:

1. ✅ All tests passing in CI/CD
2. ✅ Security audit shows no critical issues
3. ✅ Environment variables configured for production
4. ✅ Database migrations tested
5. ✅ Error tracking configured (Sentry)
6. ✅ Logging configured properly
7. ✅ Rate limiting enabled
8. ✅ HTTPS/TLS configured
9. ✅ Backup strategy in place
10. ✅ Rollback plan documented

## 📚 Additional Resources

- [TypeScript Best Practices](https://typescript-cheatsheets.netlify.app/)
- [React Native Best Practices](https://github.com/microsoft/reactxp/blob/master/docs/docs/best-practices.md)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🆘 Troubleshooting

### Type Check Failures
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npx tsc --build --clean

# Regenerate types (backend)
cd backend && npx prisma generate
```

### Linting Failures
```bash
# Auto-fix most issues
npm run lint -- --fix
```

### Test Failures
```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.ts
```

---

**Remember: Quality over speed. Taking time to ensure code quality saves debugging time later.**

**Last Updated:** 2025-11-21
