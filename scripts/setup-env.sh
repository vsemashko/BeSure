#!/bin/bash
# Environment Setup Helper Script
# Helps create and validate .env files for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}⚙️  BeSure Environment Setup${NC}"
echo "=================================================="

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -hex 64
}

# Select environment
echo ""
echo "Select environment to configure:"
echo "1) Development"
echo "2) Staging"
echo "3) Production"
read -p "Enter choice [1-3]: " env_choice

case $env_choice in
    1)
        ENV_NAME="development"
        ENV_FILE=".env.development"
        ;;
    2)
        ENV_NAME="staging"
        ENV_FILE=".env.staging"
        ;;
    3)
        ENV_NAME="production"
        ENV_FILE=".env.production"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}📋 Configuring: $ENV_NAME${NC}"
echo ""

# Check if file already exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  $ENV_FILE already exists${NC}"
    read -p "Overwrite? (y/n): " overwrite
    if [[ $overwrite != "y" ]]; then
        echo "Setup cancelled"
        exit 0
    fi
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
    echo "Backup created: ${ENV_FILE}.backup.$(date +%s)"
fi

# Start creating .env file
echo "# BeSure Backend - $ENV_NAME Environment" > "$ENV_FILE"
echo "# Generated on: $(date)" >> "$ENV_FILE"
echo "# DO NOT commit this file to version control!" >> "$ENV_FILE"
echo "" >> "$ENV_FILE"

echo -e "${BLUE}🔧 Configuring environment variables...${NC}"
echo ""

# 1. Node Environment
echo "NODE_ENV=$ENV_NAME" >> "$ENV_FILE"
echo -e "${GREEN}✓${NC} NODE_ENV set to $ENV_NAME"

# 2. Server Configuration
echo "" >> "$ENV_FILE"
echo "# Server Configuration" >> "$ENV_FILE"

read -p "Enter PORT [3000]: " PORT
PORT=${PORT:-3000}
echo "PORT=$PORT" >> "$ENV_FILE"
echo -e "${GREEN}✓${NC} PORT set to $PORT"

# 3. Database Configuration
echo "" >> "$ENV_FILE"
echo "# Database Configuration" >> "$ENV_FILE"

if [[ $ENV_NAME == "development" ]]; then
    echo "DATABASE_URL=postgresql://besure:besure@localhost:5432/besure_dev" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} DATABASE_URL set to local PostgreSQL"
else
    echo -e "${YELLOW}Enter production database URL (e.g., from Neon, Supabase, Railway)${NC}"
    read -p "DATABASE_URL: " DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL is required${NC}"
        exit 1
    fi
    echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} DATABASE_URL configured"
fi

# 4. JWT Configuration
echo "" >> "$ENV_FILE"
echo "# JWT Configuration" >> "$ENV_FILE"

if [[ $ENV_NAME == "development" ]]; then
    JWT_SECRET="dev-secret-key-do-not-use-in-production"
    echo -e "${YELLOW}⚠️  Using default dev JWT secret${NC}"
else
    echo -e "${YELLOW}Generating secure JWT secret...${NC}"
    JWT_SECRET=$(generate_jwt_secret)
    echo -e "${GREEN}✓${NC} Secure JWT secret generated"
fi

echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
echo "JWT_EXPIRES_IN=1h" >> "$ENV_FILE"
echo "JWT_REFRESH_EXPIRES_IN=7d" >> "$ENV_FILE"

# 5. Redis Configuration (optional)
echo "" >> "$ENV_FILE"
echo "# Redis Configuration (optional)" >> "$ENV_FILE"

read -p "Configure Redis? (y/n): " configure_redis
if [[ $configure_redis == "y" ]]; then
    if [[ $ENV_NAME == "development" ]]; then
        echo "REDIS_URL=redis://localhost:6379" >> "$ENV_FILE"
        echo -e "${GREEN}✓${NC} Redis URL set to local Redis"
    else
        read -p "REDIS_URL: " REDIS_URL
        echo "REDIS_URL=$REDIS_URL" >> "$ENV_FILE"
        echo -e "${GREEN}✓${NC} Redis URL configured"
    fi
else
    echo "# REDIS_URL=" >> "$ENV_FILE"
fi

# 6. AWS S3 Configuration (optional)
echo "" >> "$ENV_FILE"
echo "# AWS S3 Configuration (optional)" >> "$ENV_FILE"

read -p "Configure AWS S3 for file storage? (y/n): " configure_s3
if [[ $configure_s3 == "y" ]]; then
    read -p "AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
    read -p "AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
    read -p "AWS_REGION [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    read -p "AWS_S3_BUCKET: " AWS_S3_BUCKET

    echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> "$ENV_FILE"
    echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> "$ENV_FILE"
    echo "AWS_REGION=$AWS_REGION" >> "$ENV_FILE"
    echo "AWS_S3_BUCKET=$AWS_S3_BUCKET" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} AWS S3 configured"
else
    echo "# AWS_ACCESS_KEY_ID=" >> "$ENV_FILE"
    echo "# AWS_SECRET_ACCESS_KEY=" >> "$ENV_FILE"
    echo "# AWS_REGION=" >> "$ENV_FILE"
    echo "# AWS_S3_BUCKET=" >> "$ENV_FILE"
fi

# 7. Sentry Configuration (optional)
echo "" >> "$ENV_FILE"
echo "# Sentry Configuration (optional)" >> "$ENV_FILE"

read -p "Configure Sentry for error tracking? (y/n): " configure_sentry
if [[ $configure_sentry == "y" ]]; then
    read -p "SENTRY_DSN: " SENTRY_DSN
    echo "SENTRY_DSN=$SENTRY_DSN" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} Sentry configured"
else
    echo "# SENTRY_DSN=" >> "$ENV_FILE"
fi

# 8. Rate Limiting
echo "" >> "$ENV_FILE"
echo "# Rate Limiting" >> "$ENV_FILE"

if [[ $ENV_NAME == "production" ]]; then
    echo "RATE_LIMIT_WINDOW_MS=900000" >> "$ENV_FILE"
    echo "RATE_LIMIT_MAX_REQUESTS=100" >> "$ENV_FILE"
else
    echo "RATE_LIMIT_WINDOW_MS=900000" >> "$ENV_FILE"
    echo "RATE_LIMIT_MAX_REQUESTS=1000" >> "$ENV_FILE"
fi
echo -e "${GREEN}✓${NC} Rate limiting configured"

# 9. CORS
echo "" >> "$ENV_FILE"
echo "# CORS Configuration" >> "$ENV_FILE"

if [[ $ENV_NAME == "development" ]]; then
    echo "CORS_ORIGIN=http://localhost:19006,http://localhost:19000" >> "$ENV_FILE"
else
    read -p "Enter allowed CORS origins (comma-separated): " CORS_ORIGIN
    echo "CORS_ORIGIN=$CORS_ORIGIN" >> "$ENV_FILE"
fi
echo -e "${GREEN}✓${NC} CORS configured"

# 10. Logging
echo "" >> "$ENV_FILE"
echo "# Logging Configuration" >> "$ENV_FILE"

if [[ $ENV_NAME == "production" ]]; then
    LOG_LEVEL="info"
else
    LOG_LEVEL="debug"
fi

echo "LOG_LEVEL=$LOG_LEVEL" >> "$ENV_FILE"
echo -e "${GREEN}✓${NC} Logging level set to $LOG_LEVEL"

# Validation
echo ""
echo -e "${YELLOW}🔍 Validating configuration...${NC}"

# Check required variables
REQUIRED_VARS=("NODE_ENV" "PORT" "DATABASE_URL" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required variables configured${NC}"
else
    echo -e "${RED}❌ Missing required variables: ${MISSING_VARS[*]}${NC}"
    exit 1
fi

# Security warnings
echo ""
echo -e "${YELLOW}🔒 Security Checklist:${NC}"

if [[ $ENV_NAME == "production" ]]; then
    if [[ $JWT_SECRET == *"dev"* ]] || [[ $JWT_SECRET == *"test"* ]]; then
        echo -e "${RED}❌ JWT_SECRET looks insecure for production${NC}"
    else
        echo -e "${GREEN}✓${NC} JWT_SECRET looks secure"
    fi

    if [[ $DATABASE_URL == *"localhost"* ]]; then
        echo -e "${RED}❌ DATABASE_URL points to localhost in production${NC}"
    else
        echo -e "${GREEN}✓${NC} DATABASE_URL configured for production"
    fi
fi

# Save summary
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Environment configuration complete!${NC}"
echo "=================================================="
echo ""
echo "Configuration saved to: $ENV_FILE"
echo ""
echo "Next steps:"
echo "1. Review the generated file: cat $ENV_FILE"
echo "2. Add $ENV_FILE to .gitignore"
echo "3. Never commit this file to version control"
echo "4. For production, add these variables to your hosting platform"
echo ""

if [[ $ENV_NAME == "production" ]]; then
    echo -e "${RED}⚠️  IMPORTANT: Store $ENV_FILE securely!${NC}"
    echo "Consider using a password manager or secure vault"
fi

echo ""
echo -e "${BLUE}To use this configuration:${NC}"
echo "export \$(cat $ENV_FILE | xargs)"
echo ""
