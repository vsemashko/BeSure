#!/bin/bash
# Render Deployment Script for BeSure Backend
# This script automates deployment to Render with safety checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 BeSure Render Deployment Script${NC}"
echo "=================================================="

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
        DEPLOY_ENV="production"
        GIT_BRANCH="main"
        ;;
    2)
        DEPLOY_ENV="staging"
        GIT_BRANCH="develop"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}📋 Selected environment: $DEPLOY_ENV (branch: $GIT_BRANCH)${NC}"

# Pre-deployment checks
echo ""
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# 1. Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ $CURRENT_BRANCH != $GIT_BRANCH ]]; then
    echo -e "${RED}❌ Error: You are on branch '$CURRENT_BRANCH'${NC}"
    echo "Expected branch: $GIT_BRANCH"
    read -p "Continue anyway? (y/n): " continue_branch
    if [[ $continue_branch != "y" ]]; then
        exit 1
    fi
fi

# 2. Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/n): " continue_uncommitted
    if [[ $continue_uncommitted != "y" ]]; then
        exit 1
    fi
fi

# 3. Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:ci
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All tests passed${NC}"

# 4. Run type checking
echo -e "${YELLOW}📝 Running type checks...${NC}"
npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type check failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Type check passed${NC}"

# 5. Run linter
echo -e "${YELLOW}🔧 Running linter...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Linting failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Linting passed${NC}"

# 6. Security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Security vulnerabilities found${NC}"
    read -p "Continue anyway? (y/n): " continue_audit
    if [[ $continue_audit != "y" ]]; then
        exit 1
    fi
fi

# 7. Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Push to git (Render deploys from git)
echo ""
echo -e "${YELLOW}📤 Pushing to git...${NC}"

if [[ $DEPLOY_ENV == "production" ]]; then
    echo -e "${RED}⚠️  You are about to push to PRODUCTION (main branch)${NC}"
    read -p "Are you sure? Type 'push' to confirm: " confirm
    if [[ $confirm != "push" ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

git push origin $GIT_BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git push failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pushed to git${NC}"

# Render will automatically deploy from the pushed branch
echo ""
echo -e "${GREEN}✅ Code pushed successfully!${NC}"
echo "=================================================="
echo -e "${YELLOW}Render will now automatically deploy from the $GIT_BRANCH branch${NC}"
echo "=================================================="
echo ""
echo "Monitor deployment at:"
echo "https://dashboard.render.com/"
echo ""
echo "After deployment completes:"
echo "1. Check service logs in Render dashboard"
echo "2. Run health check: ./scripts/health-check.sh <your-render-url>"
echo "3. Run smoke tests: ./scripts/smoke-test.sh <your-render-url>"
echo ""

# Ask if user wants to monitor deployment
read -p "Open Render dashboard? (y/n): " open_dashboard
if [[ $open_dashboard == "y" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://dashboard.render.com/"
    elif command -v open &> /dev/null; then
        open "https://dashboard.render.com/"
    else
        echo "Please open https://dashboard.render.com/ manually"
    fi
fi

echo ""
echo -e "${GREEN}📝 Note: Render deployment typically takes 2-5 minutes${NC}"
echo "The deployment will include:"
echo "  ✓ Building Docker image"
echo "  ✓ Running database migrations"
echo "  ✓ Starting the service"
echo "  ✓ Health checks"
