# BeSure Backend API

RESTful API for the BeSure mutual voting platform.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT
- **Caching:** Redis (optional)
- **File Storage:** S3-compatible (Cloudflare R2)

## Features Implemented

### ✅ MVP Core Features

- **Authentication System**
  - User registration with email/password
  - Login with JWT tokens
  - Password validation (8+ chars, number, special char)
  - Username validation (unique, 3-50 chars)

- **Point System**
  - Starting balance: 10 points
  - Earn points for voting: +2 points
  - Spend points to create questions: 10-18 points
  - Question completion rewards based on engagement
  - Transaction history and audit trail
  - Balance checking and insufficient funds handling

- **Question Management**
  - Create questions with 2-6 options (text or images)
  - Set expiration (5 minutes to 7 days)
  - Anonymous mode support
  - Privacy levels (public, friends)
  - Dynamic cost calculation
  - Auto-close expired questions
  - Delete questions (with refund if no votes)

- **Voting System**
  - Cast votes on questions
  - Earn points immediately
  - Prevent duplicate votes
  - Vote validation (question status, expiration, ownership)
  - Voting history tracking
  - Real-time vote counts and percentages

- **Question Feed**
  - Multiple feed modes (urgent, popular, for you)
  - Pagination support
  - Exclude questions user has voted on
  - Filter by status and expiration

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error handling, rate limiting
│   │   ├── routes/          # API routes
│   │   └── validators/      # Input validation (future)
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── points.service.ts
│   │   ├── question.service.ts
│   │   └── vote.service.ts
│   ├── db/
│   │   ├── models/          # (Prisma handles this)
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data (future)
│   ├── config/
│   │   ├── constants.ts     # Configuration
│   │   └── database.ts      # Prisma client
│   ├── utils/
│   │   ├── errors.ts        # Custom error classes
│   │   ├── helpers.ts       # Utility functions
│   │   └── logger.ts        # Winston logger
│   ├── types/               # TypeScript types (future)
│   ├── app.ts              # Express app configuration
│   └── index.ts            # Server entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── tests/                  # Tests (future)
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+
- Redis (optional, for production)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   # Create PostgreSQL database
   createdb besure_dev

   # Run migrations
   npm run migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/besure_dev
JWT_SECRET=your-secret-key

# Optional (with defaults)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:19000
```

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check

```http
GET /api/v1/health
```

Returns server status and uptime.

#### Authentication

**Register**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Get Current User**
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Questions

**Create Question**
```http
POST /api/v1/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Which color should I paint my room?",
  "description": "Need help deciding!",
  "options": [
    { "content": "Light blue" },
    { "content": "Dark green" },
    { "content": "Warm gray" }
  ],
  "expiresInMinutes": 1440,
  "isAnonymous": false,
  "privacyLevel": "public"
}
```

**Get Question Feed**
```http
GET /api/v1/questions?mode=urgent&limit=20&offset=0
```

Query parameters:
- `mode`: `urgent`, `popular`, or `foryou` (default: `foryou`)
- `limit`: Number of questions (default: 20)
- `offset`: Pagination offset (default: 0)

**Get Single Question**
```http
GET /api/v1/questions/:id
```

**Get My Questions**
```http
GET /api/v1/questions/my?limit=20&offset=0
Authorization: Bearer <token>
```

**Delete Question**
```http
DELETE /api/v1/questions/:id
Authorization: Bearer <token>
```

#### Voting

**Cast Vote**
```http
POST /api/v1/votes
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": "uuid",
  "optionId": "uuid"
}
```

**Get My Votes**
```http
GET /api/v1/votes/my?limit=50&offset=0
Authorization: Bearer <token>
```

**Get Question Votes**
```http
GET /api/v1/votes/question/:questionId
```

**Get Question Stats**
```http
GET /api/v1/votes/question/:questionId/stats
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-21T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-11-21T10:00:00.000Z"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `AUTHENTICATION_ERROR` (401): Missing or invalid token
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate entry or conflict
- `INSUFFICIENT_POINTS` (400): Not enough points
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Database Schema

The database is managed using Prisma. See `prisma/schema.prisma` for the full schema.

### Core Models

- **User** - User accounts with authentication
- **Question** - User-created questions
- **QuestionOption** - Options for each question
- **Vote** - User votes on questions
- **PointTransaction** - Audit trail of all point changes
- **UserPointStats** - Cached point statistics
- **Topic** - Categories for questions
- **UserInterest** - User topic preferences
- **UserTopicExpertise** - Topic expertise tracking

### Running Migrations

```bash
# Create a new migration
npm run migrate

# Deploy migrations to production
npm run migrate:deploy

# View database in Prisma Studio
npm run db:studio
```

## Point System

### Earning Points

- **Vote on question:** +2 points (instant)
- **Question completion:** Base 5 points + bonuses
  - +0.5 points per vote received
  - +5 points for 20+ votes
  - +10 points for 50+ votes
  - +20 points for 100+ votes
  - -5 points if <5 votes (penalty)

### Spending Points

- **Basic question:** 10 points
- **Anonymous modifier:** +3 points
- **Urgent modifier (<6 hours):** +5 points

**Examples:**
- Public question, 24 hours: 10 points
- Anonymous question, 24 hours: 13 points
- Anonymous + urgent question, 3 hours: 18 points

### Starting Balance

New users start with **10 points** - enough to create one question or vote 5 times.

## Development

### Scripts

```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Lint code with ESLint
npm run lint:fix     # Fix linting errors
npm test             # Run tests (coming soon)
npm run migrate      # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Code Style

- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting (configure in your editor)
- Use `async/await` over callbacks
- Use Prisma for all database operations
- Always use proper error handling

### Adding New Features

1. **Service Layer** (`src/services/`)
   - Business logic and database operations
   - Use Prisma for queries
   - Throw custom errors for validation

2. **Controller** (`src/api/controllers/`)
   - Handle HTTP requests/responses
   - Call service methods
   - Use `asyncHandler` wrapper

3. **Routes** (`src/api/routes/`)
   - Define API endpoints
   - Add authentication middleware if needed
   - Import and use controller methods

4. **Update** `src/api/routes/index.ts`
   - Register new routes

## Security

- **Password hashing:** bcrypt with 10 salt rounds
- **JWT tokens:** 15-minute access tokens
- **Rate limiting:** 100 requests per 15 minutes (general), 5 per 15 minutes (auth)
- **Input validation:** All inputs validated before processing
- **SQL injection protection:** Prisma parameterized queries
- **CORS:** Configured for specific origins only
- **Helmet:** Security headers enabled

## Performance

- **Database indexing:** Indexes on frequently queried fields
- **Pagination:** All list endpoints support pagination
- **Caching:** Redis support for production (optional)
- **Transactions:** Critical operations use database transactions
- **Connection pooling:** Prisma manages connection pool

## Deployment

### Railway (Recommended)

1. Create new project on Railway
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables
5. Run migrations: `npm run migrate:deploy`

### Environment Variables for Production

```bash
NODE_ENV=production
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<strong-random-secret>
PORT=3000
CORS_ORIGIN=https://your-app.com
```

## Testing

Testing infrastructure is set up but tests need to be implemented.

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Monitoring & Logging

- **Winston** for structured logging
- Logs saved to `logs/` directory
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console logging in development

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Reset database
npx prisma migrate reset
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill
```

### TypeScript Errors

```bash
# Clean build and rebuild
rm -rf dist
npm run build
```

## Future Enhancements

- [ ] Redis caching layer
- [ ] WebSocket support for real-time updates
- [ ] Image upload and processing
- [ ] OpenAI integration for content moderation
- [ ] Advanced recommendations algorithm
- [ ] Streak system and daily challenges
- [ ] Topic detection and categorization
- [ ] Comprehensive test suite
- [ ] API documentation with Swagger/OpenAPI
- [ ] GraphQL API (optional)

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create pull request

## License

MIT

## Support

For issues or questions, create an issue on GitHub.

---

**Built with ❤️ for the BeSure MVP**
