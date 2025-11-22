#!/bin/bash
# Safe Production Database Migration Script
# This script applies Prisma migrations with safety checks and backups

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  BeSure Production Migration Script${NC}"
echo "=================================================="

# Check if we're in the backend directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: prisma/schema.prisma not found${NC}"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable not set${NC}"
    echo ""
    echo "Set it with:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo -e "${GREEN}✅ Database URL configured${NC}"

# Extract database name from URL for display (mask password)
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+).*/\1/')
echo -e "${YELLOW}📍 Target database: $DB_HOST${NC}"

# Safety confirmation
echo ""
echo -e "${RED}⚠️  WARNING: This will modify the production database${NC}"
echo ""
read -p "Are you absolutely sure? Type 'MIGRATE' to confirm: " confirm

if [[ $confirm != "MIGRATE" ]]; then
    echo "Migration cancelled"
    exit 0
fi

# Create backup before migration
echo ""
echo -e "${YELLOW}💾 Creating backup before migration...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

# Extract connection details for pg_dump
DB_USER=$(echo $DATABASE_URL | sed -E 's/.*\/\/([^:]+):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed -E 's/.*\/\/[^:]+:([^@]+)@.*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:\/]+).*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')

# Create backup using pg_dump
export PGPASSWORD=$DB_PASS
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo -e "${RED}❌ Backup failed! Aborting migration${NC}"
    exit 1
fi

# Check pending migrations
echo ""
echo -e "${YELLOW}🔍 Checking for pending migrations...${NC}"

# Generate Prisma client first
npx prisma generate

# Get migration status
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)

echo "$MIGRATION_STATUS"

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo ""
    echo -e "${GREEN}✅ No pending migrations${NC}"
    echo "Database is already up to date"
    exit 0
fi

# Apply migrations
echo ""
echo -e "${YELLOW}🚀 Applying migrations...${NC}"
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
    echo "=================================================="
    echo ""
    echo "Backup saved to: $BACKUP_FILE"
    echo ""
    echo "To restore backup if needed:"
    echo "pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_FILE"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    echo ""
    echo "To restore from backup:"
    echo "pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_FILE"
    echo ""
    exit 1
fi

# Verify migration
echo -e "${YELLOW}🔍 Verifying migration...${NC}"
VERIFY_STATUS=$(npx prisma migrate status 2>&1)

if echo "$VERIFY_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Migration verified successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Verification shows unexpected status${NC}"
    echo "$VERIFY_STATUS"
fi

# Clean up old backups (keep last 10)
echo ""
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
ls -t backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm
echo -e "${GREEN}✅ Cleanup complete (kept 10 most recent backups)${NC}"

echo ""
echo -e "${GREEN}🎉 Migration process completed!${NC}"
