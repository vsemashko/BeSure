# BeSure - Local Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10 or later) and **Docker Compose** (v2.0 or later)
- **Node.js** v22.x (LTS)
- **npm** v10.x or later
- **Git** for version control

## Quick Start with Docker

The fastest way to get the project running locally is using Docker Compose:

```bash
# 1. Clone the repository
git clone <repository-url>
cd BeSure

# 2. Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# 3. Check service health
docker-compose ps

# 4. View logs
docker-compose logs -f backend
```

The backend API will be available at `http://localhost:3000`

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```bash
# Database
DATABASE_URL="postgresql://besure:besure_dev_password@localhost:5432/besure_dev"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="development"
PORT=3000

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# OpenAI (for content moderation)
OPENAI_API_KEY="your-openai-api-key"

# Expo Push Notifications
EXPO_ACCESS_TOKEN="your-expo-access-token"

# CORS
CORS_ORIGIN="http://localhost:8081,exp://localhost:8081"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Mobile Environment Variables

Create a `.env` file in the `/mobile` directory:

```bash
EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

**Important for iOS Simulator:**
```bash
EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

**Important for Android Emulator:**
```bash
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000/api/v1"
```

## Manual Setup (Without Docker)

If you prefer to run services manually:

### 1. Database Setup

Install PostgreSQL 16 locally, then:

```bash
# Create database
createdb besure_dev

# Or using psql
psql -U postgres
CREATE DATABASE besure_dev;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

The backend will start at `http://localhost:3000`

### 3. Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Or with specific platform
npx expo start --ios
npx expo start --android
```

## Database Management

### Running Migrations

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```

Access Prisma Studio at `http://localhost:5555`

### PgAdmin (Optional)

If using Docker Compose, uncomment the `pgadmin` service in `docker-compose.yml`:

```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@besure.local
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
```

Access PgAdmin at `http://localhost:5050`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Mobile Tests

```bash
cd mobile

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Code Quality

### Linting

```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Mobile
cd mobile
npm run lint
npm run lint:fix
```

### Type Checking

```bash
# Backend
cd backend
npm run type-check

# Mobile
cd mobile
npm run type-check
```

### Security Audit

```bash
# Backend
cd backend
npm run security:audit

# Mobile
cd mobile
npm audit
```

## Docker Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute commands in container
docker-compose exec backend sh
docker-compose exec postgres psql -U besure -d besure_dev

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## Troubleshooting

### Backend won't start

**Issue**: "Cannot connect to database"

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

**Issue**: "Port 3000 already in use"

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
PORT=3001
```

### Mobile app can't connect to backend

**Issue**: "Network request failed"

**Solution**:
```bash
# For iOS Simulator, use localhost:
EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"

# For Android Emulator, use special IP:
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000/api/v1"

# For physical device, use your computer's local IP:
EXPO_PUBLIC_API_URL="http://192.168.1.x:3000/api/v1"
```

### Prisma errors

**Issue**: "Prisma Client not generated"

**Solution**:
```bash
cd backend
npx prisma generate
```

**Issue**: "Migration failed"

**Solution**:
```bash
# Reset database and rerun migrations
npx prisma migrate reset

# Or force apply migrations
npx prisma migrate deploy --force
```

### Docker issues

**Issue**: "Container keeps restarting"

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Check if database is healthy
docker-compose exec postgres pg_isready -U besure

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

## Development Workflow

### Feature Development

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes to code

3. Run tests and linting:
```bash
# Backend
cd backend
npm run lint
npm run type-check
npm test

# Mobile
cd mobile
npm run lint
npm run type-check
```

4. Commit changes:
```bash
git add .
git commit -m "feat: your feature description"
```

5. Push and create PR:
```bash
git push origin feature/your-feature-name
```

### Database Schema Changes

1. Modify `backend/prisma/schema.prisma`

2. Create migration:
```bash
cd backend
npx prisma migrate dev --name add_new_feature
```

3. Migration file created in `prisma/migrations/`

4. Commit both schema.prisma and migration files

### API Changes

1. Update service in `backend/src/services/`
2. Update controller in `backend/src/api/controllers/`
3. Update routes in `backend/src/api/routes/`
4. Update mobile API client in `mobile/src/api/`
5. Update TypeScript types in both backend and mobile

## Useful Scripts

### Backend

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run security:audit   # Run security audit
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

### Mobile

```bash
npx expo start           # Start Expo dev server
npx expo start --ios     # Start for iOS
npx expo start --android # Start for Android
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm test                 # Run tests
npx expo export          # Build for production
npx expo-doctor          # Check Expo configuration
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Support

For issues and questions:
- Check the [AUDIT_REPORT.md](./AUDIT_REPORT.md) for known issues
- Review closed issues on GitHub
- Contact the development team

## Next Steps

After setting up the development environment:

1. Review the [AUDIT_REPORT.md](./AUDIT_REPORT.md) for known issues and improvements
2. Check the GitHub Issues for current work items
3. Read the API documentation (when available)
4. Review the codebase architecture in `backend/src/` and `mobile/src/`
