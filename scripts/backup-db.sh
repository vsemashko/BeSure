#!/bin/bash
# Database Backup Script for BeSure
# Creates timestamped backups of PostgreSQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}💾 BeSure Database Backup${NC}"
echo "=================================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable not set${NC}"
    echo ""
    echo "Set it with:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Parse DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -E 's/.*\/\/([^:]+):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed -E 's/.*\/\/[^:]+:([^@]+)@.*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:\/]+).*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')

echo -e "${GREEN}✅ Database connection configured${NC}"
echo -e "${YELLOW}📍 Database: $DB_NAME @ $DB_HOST:$DB_PORT${NC}"
echo ""

# Create backups directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/besure_${DB_NAME}_${TIMESTAMP}.sql"

echo -e "${YELLOW}🔄 Creating backup...${NC}"
echo "Backup file: $BACKUP_FILE"
echo ""

# Set password for pg_dump
export PGPASSWORD=$DB_PASS

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully!${NC}"

    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "=================================================="
    echo "Backup Details:"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $BACKUP_SIZE"
    echo "  Database: $DB_NAME"
    echo "  Timestamp: $(date)"
    echo "=================================================="
    echo ""

    # Compression option
    read -p "Compress backup? (y/n): " compress
    if [[ $compress == "y" ]]; then
        echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
        gzip "$BACKUP_FILE"
        COMPRESSED_FILE="${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
        echo -e "${GREEN}✅ Compressed to $COMPRESSED_SIZE${NC}"
        echo "Compressed file: $COMPRESSED_FILE"
        BACKUP_FILE=$COMPRESSED_FILE
    fi

    echo ""
    echo "To restore this backup:"
    if [[ $BACKUP_FILE == *.gz ]]; then
        echo "gunzip -c $BACKUP_FILE | pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c"
    else
        echo "pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_FILE"
    fi

    # Cleanup old backups
    echo ""
    read -p "Clean up old backups? (keeps last 10) (y/n): " cleanup
    if [[ $cleanup == "y" ]]; then
        echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
        cd "$BACKUP_DIR"
        ls -t besure_*.sql* 2>/dev/null | tail -n +11 | xargs -r rm
        REMAINING=$(ls -1 besure_*.sql* 2>/dev/null | wc -l)
        echo -e "${GREEN}✅ Cleanup complete ($REMAINING backups remaining)${NC}"
        cd ..
    fi

    # Upload to cloud storage (optional)
    echo ""
    echo -e "${YELLOW}💡 Tip: Upload to cloud storage for disaster recovery${NC}"
    echo "Examples:"
    echo "  AWS S3: aws s3 cp $BACKUP_FILE s3://your-bucket/backups/"
    echo "  Google Cloud: gsutil cp $BACKUP_FILE gs://your-bucket/backups/"
    echo ""

else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
