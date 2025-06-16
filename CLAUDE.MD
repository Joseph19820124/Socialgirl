# CLAUDE.MD - Social Media Automation Web App

## Project Overview

**Purpose**: A TypeScript-based web application for running automations and AI agents that connects to social media APIs (YouTube, Instagram, TikTok) to scrape and display content analytics in a custom table interface.

**Architecture**:

- Frontend: TypeScript with custom HTML/CSS UI (`kentab_ui.html`)
- Backend: Node.js/TypeScript with Express API
- AI Integration: OpenAI Agents JS SDK for intelligent automation
- Data Sources: YouTube Data API, Instagram Basic Display API, TikTok API
- Database: PostgreSQL with Prisma ORM (optional)
- Cache: Redis for API response caching
- Queue: Bull for background job processing

**Key Dependencies**:

```json
{
  "dependencies": {
    "@openai/agents": "^1.0.0",
    "express": "^4.18.2",
    "typescript": "^5.3.3",
    "axios": "^1.6.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "joi": "^17.11.0",
    "prisma": "^5.7.1",
    "redis": "^4.6.12",
    "bull": "^4.12.0",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "@commitlint/cli": "^18.4.4",
    "@commitlint/config-conventional": "^18.4.4",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

**Directory Structure**:

```bash
/
├── src/
│   ├── agents/         # AI agent definitions and workflows
│   ├── api/           # Express API routes
│   ├── services/      # Social media API integrations
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper functions and utilities
│   ├── middleware/    # Express middleware
│   ├── config/        # Configuration files
│   ├── database/      # Database models and migrations
│   └── public/        # Static assets (includes kentab_ui.html)
├── tests/            # Test files mirroring src structure
├── dist/             # Compiled JavaScript output
├── scripts/          # Utility scripts
├── .github/          # GitHub Actions workflows
└── docs/             # API and project documentation
```

## Development Commands

```bash
# Installation
npm install                      # Install all dependencies
npm run setup                    # Initial project setup (DB, env, etc.)

# Development
npm run dev                      # Start dev server with hot reload (nodemon + ts-node)
npm run dev:debug                # Start with Node.js inspector on port 9229
npm run build                    # Compile TypeScript to JavaScript
npm run start                    # Run production server
npm run watch                    # Watch mode for TypeScript compilation

# Testing
npm test                         # Run all tests with coverage
npm run test:watch              # Run tests in watch mode
npm run test:unit               # Run unit tests only
npm run test:integration        # Run integration tests only
npm run test:e2e                # Run end-to-end tests

# Code Quality
npm run lint                     # ESLint with TypeScript rules
npm run lint:fix                # Fix auto-fixable lint issues
npm run format                   # Prettier code formatting
npm run format:check            # Check formatting without fixing
npm run typecheck               # TypeScript type checking
npm run validate                # Run all checks (lint, format, typecheck, test)

# Security & Performance
npm run security:check          # npm audit + snyk test
npm run security:fix            # Auto-fix security vulnerabilities
npm run performance:profile     # Run performance profiling
npm run bundle:analyze          # Analyze bundle size

# Database (if using PostgreSQL)
npm run db:migrate              # Run database migrations
npm run db:migrate:dev          # Create new migration
npm run db:seed                 # Seed database with test data
npm run db:reset                # Reset database (DANGER: drops all data)
npm run db:studio               # Open Prisma Studio GUI

# Git Hooks (automatically run via husky)
npm run pre-commit              # Lint staged files
npm run pre-push                # Run full validation
npm run commit-msg              # Validate commit message format

# Utilities
npm run clean                   # Remove dist and node_modules
npm run clean:cache             # Clear all caches (Redis, npm, etc.)
npm run docs:generate           # Generate API documentation
npm run env:validate            # Validate .env file
```

## Package.json Scripts Section

```json
{
  "scripts": {
    "setup": "node scripts/setup.js && npm run db:migrate && npm run env:validate",
    "dev": "NODE_ENV=development nodemon",
    "dev:debug": "NODE_ENV=development nodemon --inspect",
    "build": "tsc && cp -r src/public dist/",
    "start": "NODE_ENV=production node dist/index.js",
    "watch": "tsc -w",
    "test": "jest --coverage --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=unit --coverage",
    "test:integration": "jest --testPathPattern=integration --detectOpenHandles",
    "test:e2e": "jest --testPathPattern=e2e --runInBand",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "validate": "npm run lint && npm run format:check && npm run typecheck && npm test",
    "security:check": "npm audit && npx snyk test",
    "security:fix": "npm audit fix && npx snyk wizard",
    "performance:profile": "node --prof dist/index.js && node --prof-process isolate-*.log > profile.txt",
    "bundle:analyze": "webpack-bundle-analyzer dist/stats.json",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:seed": "ts-node scripts/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "pre-commit": "lint-staged",
    "pre-push": "npm run validate",
    "commit-msg": "commitlint --edit $1",
    "clean": "rm -rf dist node_modules",
    "clean:cache": "rm -rf .cache tmp redis-dump.rdb",
    "docs:generate": "typedoc --out docs/api src",
    "env:validate": "node scripts/validate-env.js"
  }
}
```

## Team Onboarding

### Prerequisites

- Node.js 18+ and npm 9+
- Git 2.30+
- PostgreSQL 14+ (optional, for persistent storage)
- Redis 7+ (optional, for caching)
- VS Code with recommended extensions

### Initial Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd socialgirl
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   npm run env:validate
   ```

3. **Required API Keys**
   - OpenAI API Key: https://platform.openai.com/api-keys
   - YouTube Data API: https://console.cloud.google.com/apis/
   - Instagram Basic Display: https://developers.facebook.com/docs/instagram-basic-display-api
   - TikTok API: https://developers.tiktok.com/

4. **Database Setup** (if using PostgreSQL)
   ```bash
   createdb socialgirl_dev
   npm run db:migrate
   npm run db:seed  # Optional: load test data
   ```

5. **Verify Installation**
   ```bash
   npm run validate  # Should pass all checks
   npm run dev      # Should start development server
   ```

6. **VS Code Setup**
   - Install recommended extensions (see `.vscode/extensions.json`)
   - Configure settings (see `.vscode/settings.json`)
   - Set up debugging (see `.vscode/launch.json`)

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests first (TDD)
3. Implement feature
4. Run `npm run validate` before committing
5. Commit with conventional format: `feat: add new feature`
6. Push and create PR

## Code Standards

- **Files**: Max 300 lines, split into focused modules, one class/component per file
- **Functions**: Max 50 lines, single responsibility, max 5 params, early returns
- **Testing**: Write tests FIRST (TDD), mirror source file names, independent tests, min 80% coverage
- **Errors**: Explicit handling, proper logging with Winston, clear messages, never silent catches
- **Documentation**: Document all public APIs, explain "why" not "what", JSDoc for functions
- **Security**: No hardcoded secrets, validate all inputs with Joi, use env vars, sanitize outputs
- **Performance**: Profile critical paths, implement caching, use pagination for large datasets

## Development Workflow

### Pre-commit Checks (Automated via Husky)

1. Lint staged files
2. Format code with Prettier
3. Run TypeScript type checking
4. Run affected unit tests
5. Validate commit message format

### Pre-push Checks

1. Run full test suite
2. Check code coverage (min 80%)
3. Run security audit
4. Validate bundle size

### Branch Protection Rules

- `main` branch requires:
  - PR reviews (min 1)
  - All CI checks passing
  - Up-to-date with main
  - No direct pushes

## Common Errors & Solutions

### TypeScript Errors

**Error**: `Cannot find module '@openai/agents'`
```bash
# Solution: Install the correct package
npm install @openai/agents
```

**Error**: `Type 'X' is not assignable to type 'Y'`
```bash
# Solution: Check type definitions
npm run typecheck -- --listFiles
# Update interfaces in src/types/
```

### API Integration Errors

**Error**: `Rate limit exceeded for YouTube API`
```typescript
// Solution: Implement exponential backoff
import { retry } from './utils/retry';

const data = await retry(
  () => youtube.search.list(params),
  { maxAttempts: 3, delay: 1000 }
);
```

**Error**: `Instagram API: Invalid access token`
```bash
# Solution: Refresh token
curl -X GET \
  "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={old-token}"
```

### Database Errors

**Error**: `P2002: Unique constraint failed`
```bash
# Solution: Check for duplicates
npm run db:studio  # Visual inspection
# Or update your query to use upsert
```

**Error**: `Connection timeout to Redis`
```bash
# Solution: Check Redis connection
redis-cli ping
# Update REDIS_URL in .env
```

## Performance Monitoring

### Profiling Commands

```bash
# CPU Profiling
npm run performance:profile
# Generates profile.txt with hotspots

# Memory Profiling
node --inspect dist/index.js
# Open chrome://inspect and take heap snapshots

# API Response Times
npm run dev
# Check /metrics endpoint for Prometheus data
```

### Performance Benchmarks

- API Response: < 200ms (p95)
- Database Queries: < 50ms
- Redis Cache Hit Rate: > 90%
- Memory Usage: < 512MB
- CPU Usage: < 70% under load

### Optimization Checklist

1. Enable Redis caching for API responses
2. Implement database connection pooling
3. Use indexes on frequently queried fields
4. Paginate large result sets (max 100 items)
5. Compress API responses with gzip
6. Implement request debouncing on frontend

## Security Scanning

### Automated Security Checks

```bash
# Dependency vulnerabilities
npm audit
npm run security:check

# Code security analysis
npx eslint-plugin-security

# Secret scanning
npx truffleHog --regex --entropy=False .

# OWASP dependency check
npx owasp-dependency-check --project "SocialGirl" --scan .
```

### Security Checklist

- [ ] All dependencies updated monthly
- [ ] API keys rotated quarterly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use Prisma)
- [ ] XSS protection (sanitize outputs)
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced in production

## Debugging Guide

### TypeScript Debugging

1. **VS Code Debugging**
   ```json
   // .vscode/launch.json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug TypeScript",
     "program": "${workspaceFolder}/src/index.ts",
     "preLaunchTask": "tsc: build",
     "outFiles": ["${workspaceFolder}/dist/**/*.js"],
     "sourceMaps": true
   }
   ```

2. **Chrome DevTools**
   ```bash
   npm run dev:debug
   # Open chrome://inspect
   ```

### API Debugging

```typescript
// Enable debug logging
import { logger } from './utils/logger';

logger.level = 'debug';
logger.debug('API Request:', { headers, body });
```

### OpenAI Agents Debugging

```typescript
// Enable agent logging
const agent = new Agent({
  debug: true,
  onMessage: (msg) => logger.info('Agent:', msg)
});
```

## Deployment Procedures

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Security scan clean
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Performance benchmarks met
- [ ] API documentation updated

### Netlify Deployment

```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Environment variables (set in Netlify UI)
NODE_ENV=production
API_KEYS=[encrypted]
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Post-deployment

1. Verify health check: `curl https://your-app.com/health`
2. Check error rates in monitoring
3. Validate API responses
4. Test critical user flows
5. Monitor performance metrics

## Database Migrations

### Migration Workflow

```bash
# Create new migration
npm run db:migrate:dev -- --name add_user_preferences

# Review generated SQL
cat prisma/migrations/*/migration.sql

# Apply in production
NODE_ENV=production npm run db:migrate
```

### Rollback Procedure

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back

# Emergency reset (DANGER: data loss)
npm run db:reset
```

## Monitoring & Alerts

### Health Checks

```typescript
// GET /health
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected",
    "openai": "available"
  }
}
```

### Metrics Endpoint

```typescript
// GET /metrics (Prometheus format)
app_requests_total{method="GET",status="200"} 1234
app_response_time_seconds{quantile="0.95"} 0.123
app_active_users 456
```

### Alert Thresholds

- Error rate > 5% for 5 minutes
- Response time > 1s (p95) for 10 minutes
- Memory usage > 80% for 15 minutes
- API quota < 20% remaining
- Database connections > 80% of pool

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run validate
      - run: npm run security:check
      - uses: codecov/codecov-action@v3

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/deploy@v1
        with:
          prod: true
```

## Stack-Specific Guidelines

### TypeScript Conventions

- Use strict mode (`"strict": true` in tsconfig.json)
- Define interfaces for all API responses
- Use enums for constants
- Prefer `const` over `let`, avoid `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Implement proper error types extending `Error`

### OpenAI Agents SDK (@openai/agents)

- Create reusable agent templates in `/src/agents`
- Implement rate limiting (3 requests/second)
- Log all agent interactions for debugging
- Use streaming responses for better UX
- Handle token limits (4096 for completions)
- Implement conversation memory management

### Social Media APIs

- Implement retry logic with exponential backoff
- Cache API responses (TTL: 5 minutes minimum)
- Use pagination for large data sets
- Store API credentials in environment variables only
- Monitor rate limits and quota usage
- Implement webhook handlers for real-time updates

### Frontend Integration

- Keep `kentab_ui.html` as the base template
- Use TypeScript for all DOM manipulation
- Implement WebSocket for real-time updates
- Follow the existing Orbitron font and neon theme
- Lazy load social media content
- Implement virtual scrolling for large tables

## Critical Rules

- Run ALL tests before marking PR as ready
- Check linting and formatting before commits
- Ask before installing new dependencies
- Follow existing patterns in the codebase
- When fixing issues, verify the fix works
- Document breaking changes in CHANGELOG.md
- Update API documentation for endpoint changes
- Performance profile before major releases

## Emergency Procedures

### Production Incident Response

1. **Immediate Actions**
   - Check health endpoint
   - Review error logs
   - Check external service status

2. **Rollback Procedure**
   ```bash
   # Netlify rollback
   netlify rollback
   
   # Docker rollback
   docker pull your-app:previous-version
   docker-compose up -d
   ```

3. **Communication**
   - Update status page
   - Notify team via Slack
   - Create incident ticket

### Data Recovery

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Redis backup
redis-cli BGSAVE

# Restore procedures documented in /docs/disaster-recovery.md
```

## Project-Specific Context

### API Rate Limits

- YouTube: 10,000 quota units/day (search costs 100 units)
- Instagram: 200 requests/hour per user
- TikTok: 1000 requests/day
- OpenAI: 3 requests/second, 10,000 tokens/minute

### Caching Strategy

```typescript
// Cache keys format
`youtube:search:${query}:${page}` // TTL: 1 hour
`instagram:user:${userId}`         // TTL: 15 minutes
`tiktok:video:${videoId}`         // TTL: 30 minutes
```

### Performance Targets

- Page Load: < 3 seconds
- API Response: < 200ms (cached), < 2s (uncached)
- Table Render: < 100ms for 1000 rows
- Memory Usage: < 512MB per instance
- Concurrent Users: Support 1000+ via horizontal scaling

---

*Last Updated: 2025-01-16*
*Version: 1.0.0*
*Maintained by: Development Team*