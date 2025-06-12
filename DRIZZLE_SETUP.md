# Drizzle ORM + PostgreSQL Setup

This document explains how to use the Drizzle ORM setup with PostgreSQL in your React Router v7 application.

## Setup Instructions

### 1. Install PostgreSQL

Make sure you have PostgreSQL installed and running on your system:

- **macOS (with Homebrew)**: `brew install postgresql && brew services start postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE higtribe;

# Create user (optional)
CREATE USER higtribe_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE higtribe TO higtribe_user;

# Exit psql
\q
```

### 3. Environment Configuration

Create a `.env` file in your project root with database configuration:

```env
# Database Configuration
# Option 1: Full connection string (recommended)
DATABASE_URL=postgres://postgres:password@localhost:5432/higtribe

# Option 2: Individual connection parameters (used if DATABASE_URL is not set)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=higtribe
DB_USER=postgres
DB_PASSWORD=password

# Application Environment
NODE_ENV=development
APP_ENV=development
```

### 4. Run Database Migrations

```bash
# Generate migration files from schema
pnpm run db:generate

# Apply migrations to database
pnpm run db:push
```

### 5. Start the Application

```bash
pnpm run dev
```

## API Endpoints

### GET /api/users

Retrieve all users with optional filtering:

```bash
# Get all users
curl http://localhost:4280/api/users

# Search users
curl "http://localhost:4280/api/users?search=john"

# Limit results
curl "http://localhost:4280/api/users?limit=5"

# Get specific user
curl "http://localhost:4280/api/users?id=1"
```

### POST /api/users

Create a new user:

```bash
curl -X POST http://localhost:4280/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## Demo Page

## Database Management Commands

```bash
# Generate migration files from schema changes
pnpm run db:generate

# Push schema changes to database (development)
pnpm run db:push

# Apply migrations (production)
pnpm run db:migrate

# Open Drizzle Studio (database GUI)
pnpm run db:studio
```

## Schema Structure

The current schema includes a `users` table with the following structure:

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

## Adding New Tables

1. Update `app/lib/schema.ts` with your new table definition
2. Run `pnpm run db:generate` to create migration files
3. Run `pnpm run db:push` to apply changes to the database
4. Create API routes in `app/routes/api.{tablename}.ts`

## Troubleshooting

### Connection Issues

1. Ensure PostgreSQL is running: `brew services list | grep postgresql`
2. Check database exists: `psql -U postgres -l`
3. Verify connection details in `.env` file
4. Check firewall/port access

### Migration Issues

1. If migrations fail, check the generated SQL in the `drizzle/` directory
2. You can manually run SQL commands: `psql -U postgres -d higtribe -f drizzle/0000_migration.sql`
3. For development, you can use `pnpm run db:push` to sync schema directly

### Common Errors

- **"relation does not exist"**: Run migrations with `pnpm run db:push`
- **"connection refused"**: PostgreSQL is not running
- **"authentication failed"**: Check username/password in `.env`

## Production Considerations

1. Use `DATABASE_URL` environment variable
2. Run migrations with `pnpm run db:migrate` instead of `db:push`
3. Set up connection pooling for high-traffic applications
4. Consider read replicas for better performance
5. Implement proper error handling and logging 