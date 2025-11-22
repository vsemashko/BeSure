#!/bin/bash
# Quick Staging Deployment Script
# Interactive wizard to deploy BeSure to staging environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     BeSure Staging Deployment Wizard 🚀           ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Install Node.js from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git not found${NC}"
    exit 1
fi
GIT_VERSION=$(git --version | cut -d' ' -f3)
echo -e "${GREEN}✓${NC} git: $GIT_VERSION"

echo ""
echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo ""

# Platform selection
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Choose Deployment Platform${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""
echo "Select your deployment platform:"
echo ""
echo -e "${YELLOW}1) Railway${NC}"
echo "   ✓ Fastest setup (5-10 minutes)"
echo "   ✓ $5/month free credit"
echo "   ✓ Built-in PostgreSQL"
echo "   ✓ Automatic SSL"
echo "   ⚠ Requires credit card for verification"
echo ""
echo -e "${YELLOW}2) Render${NC}"
echo "   ✓ Great for production-scale staging"
echo "   ✓ Free tier available"
echo "   ✓ Easy rollbacks"
echo "   ✓ Better observability"
echo "   ⚠ Free DB expires after 90 days"
echo ""
echo -e "${YELLOW}3) Manual Setup${NC}"
echo "   ✓ Full control"
echo "   ⚠ More complex"
echo ""
read -p "Enter choice [1-3]: " platform_choice

case $platform_choice in
    1)
        PLATFORM="railway"
        PLATFORM_NAME="Railway"
        ;;
    2)
        PLATFORM="render"
        PLATFORM_NAME="Render"
        ;;
    3)
        PLATFORM="manual"
        PLATFORM_NAME="Manual"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✓${NC} Selected: $PLATFORM_NAME"
echo ""

# Railway deployment
if [[ $PLATFORM == "railway" ]]; then
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo -e "${BLUE}Step 2: Railway Setup${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo ""

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Railway CLI installed"
        else
            echo -e "${RED}❌ Failed to install Railway CLI${NC}"
            echo "Install manually with: npm install -g @railway/cli"
            exit 1
        fi
    else
        echo -e "${GREEN}✓${NC} Railway CLI already installed"
    fi

    echo ""
    echo -e "${YELLOW}📝 Railway Setup Instructions:${NC}"
    echo ""
    echo "1. Go to https://railway.app/"
    echo "2. Sign up with GitHub"
    echo "3. Verify your account with credit card (free $5/month)"
    echo ""
    read -p "Press ENTER when you've completed Railway signup..."

    echo ""
    echo -e "${YELLOW}🔐 Logging into Railway...${NC}"
    railway login

    echo ""
    echo -e "${YELLOW}📦 Creating new Railway project...${NC}"
    echo ""
    echo "What would you like to name your project?"
    read -p "Project name [besure-staging]: " project_name
    project_name=${project_name:-besure-staging}

    railway init

    echo ""
    echo -e "${YELLOW}🗄️  Setting up PostgreSQL database...${NC}"
    echo ""
    echo "In the Railway dashboard that just opened:"
    echo "1. Click 'New' → 'Database' → 'PostgreSQL'"
    echo "2. Wait for database to provision (~30 seconds)"
    echo "3. DATABASE_URL will be automatically set"
    echo ""
    read -p "Press ENTER when database is provisioned..."

    echo ""
    echo -e "${YELLOW}⚙️  Configuring environment variables...${NC}"

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 64)

    railway variables set NODE_ENV=staging
    railway variables set PORT=3000
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set JWT_EXPIRES_IN=1h
    railway variables set JWT_REFRESH_EXPIRES_IN=7d
    railway variables set CORS_ORIGIN="http://localhost:19006,http://localhost:19000"
    railway variables set RATE_LIMIT_WINDOW_MS=900000
    railway variables set RATE_LIMIT_MAX_REQUESTS=1000
    railway variables set LOG_LEVEL=debug

    echo -e "${GREEN}✓${NC} Environment variables configured"

    echo ""
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    railway up

    echo ""
    echo -e "${GREEN}✅ Railway deployment initiated!${NC}"
    echo ""
    echo "Monitor deployment:"
    echo "  railway logs"
    echo ""
    echo "Get deployment URL:"
    echo "  railway status"

# Render deployment
elif [[ $PLATFORM == "render" ]]; then
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo -e "${BLUE}Step 2: Render Setup${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo ""

    echo -e "${YELLOW}📝 Render Setup Instructions:${NC}"
    echo ""
    echo "1. Go to https://render.com/"
    echo "2. Sign up with GitHub"
    echo "3. Authorize Render to access your repositories"
    echo ""
    echo "4. Create PostgreSQL Database:"
    echo "   - Click 'New +' → 'PostgreSQL'"
    echo "   - Name: besure-staging-db"
    echo "   - Database: besure"
    echo "   - User: besure"
    echo "   - Region: Oregon (or closest to you)"
    echo "   - Plan: Free"
    echo "   - Click 'Create Database'"
    echo ""
    echo "5. Copy the 'Internal Database URL' from dashboard"
    echo ""
    read -p "Press ENTER when you have the database URL..."

    echo ""
    read -p "Paste the DATABASE_URL: " DATABASE_URL

    echo ""
    echo -e "${YELLOW}⚙️  Generating configuration...${NC}"

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 64)

    echo ""
    echo -e "${GREEN}✓${NC} JWT Secret generated"
    echo ""
    echo -e "${YELLOW}📋 Environment Variables to Set in Render Dashboard:${NC}"
    echo ""
    echo "NODE_ENV=staging"
    echo "PORT=3000"
    echo "DATABASE_URL=$DATABASE_URL"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_EXPIRES_IN=1h"
    echo "JWT_REFRESH_EXPIRES_IN=7d"
    echo "CORS_ORIGIN=http://localhost:19006,http://localhost:19000"
    echo "RATE_LIMIT_WINDOW_MS=900000"
    echo "RATE_LIMIT_MAX_REQUESTS=1000"
    echo "LOG_LEVEL=debug"
    echo ""

    # Save to file
    cat > .env.staging.local << EOF
NODE_ENV=staging
PORT=3000
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:19006,http://localhost:19000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=debug
EOF

    echo -e "${GREEN}✓${NC} Saved to: .env.staging.local"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo ""
    echo "6. In Render dashboard, click 'New +' → 'Web Service'"
    echo "7. Connect your BeSure repository"
    echo "8. Configure service:"
    echo "   - Name: besure-backend-staging"
    echo "   - Environment: Node"
    echo "   - Branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "   - Build: cd backend && npm ci && npm run build && npx prisma generate"
    echo "   - Start: cd backend && npx prisma migrate deploy && npm start"
    echo ""
    echo "9. Add all environment variables from .env.staging.local"
    echo "10. Click 'Create Web Service'"
    echo ""
    echo "Deployment will start automatically!"

# Manual deployment
else
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo -e "${BLUE}Step 2: Manual Setup${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}"
    echo ""

    echo "For manual deployment, please refer to:"
    echo "  /home/user/BeSure/STAGING_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "Or run the deployment scripts directly:"
    echo "  npm run deploy:railway"
    echo "  npm run deploy:render"
fi

# Post-deployment steps
echo ""
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Verify Deployment${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}After deployment completes, verify with:${NC}"
echo ""
echo "# Health check"
echo "npm run deploy:health <YOUR_STAGING_URL>"
echo ""
echo "# Smoke tests"
echo "npm run deploy:smoke <YOUR_STAGING_URL>"
echo ""

echo -e "${GREEN}✅ Staging deployment wizard complete!${NC}"
echo ""
echo -e "${YELLOW}📚 Additional Resources:${NC}"
echo "  - Deployment Guide: /home/user/BeSure/STAGING_DEPLOYMENT_GUIDE.md"
echo "  - Scripts README: /home/user/BeSure/scripts/README.md"
echo "  - Production Guide: /home/user/BeSure/PRODUCTION_DEPLOYMENT.md"
echo ""
