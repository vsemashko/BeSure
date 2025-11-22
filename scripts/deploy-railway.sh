#!/bin/bash
# Railway Deployment Script for BeSure Backend
# This script automates deployment to Railway with safety checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 BeSure Railway Deployment Script${NC}"
echo "=================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm i -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Environment selection
echo ""
echo "Select environment:"
echo "1) Production"
echo "2) Staging"
read -p "Enter choice [1-2]: " env_choice

case $env_choice in
    1)
        RAILWAY_ENV="production"
        ;;
    2)
        RAILWAY_ENV="staging"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}📋 Selected environment: $RAILWAY_ENV${NC}"

# Pre-deployment checks
echo ""
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# 1. Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/n): " continue_uncommitted
    if [[ $continue_uncommitted != "y" ]]; then
        exit 1
    fi
fi

# 2. Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:ci
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All tests passed${NC}"

# 3. Run type checking
echo -e "${YELLOW}📝 Running type checks...${NC}"
npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type check failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Type check passed${NC}"

# 4. Run linter
echo -e "${YELLOW}🔧 Running linter...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Linting failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Linting passed${NC}"

# 5. Security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Security vulnerabilities found${NC}"
    read -p "Continue anyway? (y/n): " continue_audit
    if [[ $continue_audit != "y" ]]; then
        exit 1
    fi
fi

# 6. Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Link to Railway project
echo ""
echo -e "${YELLOW}🔗 Linking to Railway project...${NC}"
railway link

# Deploy to Railway
echo ""
echo -e "${YELLOW}🚀 Deploying to Railway ($RAILWAY_ENV)...${NC}"

if [[ $RAILWAY_ENV == "production" ]]; then
    # Production deployment with extra confirmation
    echo -e "${RED}⚠️  You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure? Type 'deploy' to confirm: " confirm
    if [[ $confirm != "deploy" ]]; then
        echo "Deployment cancelled"
        exit 0
    fi

    railway up --environment production
else
    # Staging deployment
    railway up --environment staging
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment initiated${NC}"

# Wait for deployment to complete
echo ""
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
sleep 10

# Run health check
echo ""
echo -e "${YELLOW}🏥 Running health check...${NC}"

# Get the deployment URL from Railway
DEPLOY_URL=$(railway variables get --environment $RAILWAY_ENV | grep "RAILWAY_PUBLIC_DOMAIN" | cut -d'=' -f2 || echo "")

if [ -z "$DEPLOY_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not get deployment URL automatically${NC}"
    read -p "Enter deployment URL (e.g., https://your-app.railway.app): " DEPLOY_URL
fi

# Health check
HEALTH_URL="$DEPLOY_URL/api/v1/health"
echo "Checking: $HEALTH_URL"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Health check passed! Service is running${NC}"
else
    echo -e "${RED}❌ Health check failed! HTTP Code: $HTTP_CODE${NC}"
    echo "Please check Railway logs: railway logs"
    exit 1
fi

# Run smoke tests
echo ""
echo -e "${YELLOW}🔥 Running smoke tests...${NC}"
./scripts/smoke-test.sh "$DEPLOY_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo "=================================================="
    echo -e "${GREEN}🎉 BeSure is now live at: $DEPLOY_URL${NC}"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "1. Monitor logs: railway logs"
    echo "2. Check metrics: railway metrics"
    echo "3. Test critical user flows"
    echo ""
else
    echo -e "${RED}❌ Smoke tests failed!${NC}"
    echo "Deployment completed but some tests failed"
    echo "Please investigate: railway logs"
    exit 1
fi
