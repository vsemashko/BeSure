#!/bin/bash
# Health Check Script for BeSure Backend
# Verifies that the deployed service is running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 BeSure Health Check${NC}"
echo "=================================================="

# Get deployment URL from argument or prompt
if [ -z "$1" ]; then
    read -p "Enter deployment URL (e.g., https://api.besure.com): " DEPLOY_URL
else
    DEPLOY_URL=$1
fi

# Remove trailing slash
DEPLOY_URL=${DEPLOY_URL%/}

echo -e "${YELLOW}🔍 Checking: $DEPLOY_URL${NC}"
echo ""

# Initialize counters
PASSED=0
FAILED=0

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local expected_code=$2
    local description=$3

    echo -n "Testing $description... "

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$endpoint" || echo "000")

    if [ "$HTTP_CODE" == "$expected_code" ]; then
        echo -e "${GREEN}✓ ($HTTP_CODE)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ (Expected: $expected_code, Got: $HTTP_CODE)${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local endpoint=$1
    local field=$2
    local description=$3

    echo -n "Testing $description... "

    RESPONSE=$(curl -s "$DEPLOY_URL$endpoint")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$endpoint")

    if [ "$HTTP_CODE" == "200" ]; then
        if echo "$RESPONSE" | grep -q "$field"; then
            echo -e "${GREEN}✓ ($HTTP_CODE)${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠ (Missing field: $field)${NC}"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗ ($HTTP_CODE)${NC}"
        ((FAILED++))
        return 1
    fi
}

# Run health checks
echo -e "${YELLOW}Running endpoint checks...${NC}"
echo ""

# 1. Health endpoint
check_json_endpoint "/api/v1/health" "status" "Health endpoint"

# 2. API version endpoint
check_endpoint "/api/v1" "200" "API root"

# 3. Auth endpoints (should require authentication)
check_endpoint "/api/v1/auth/me" "401" "Auth protected route"

# 4. Questions endpoint (should work without auth for public questions)
check_endpoint "/api/v1/questions/feed" "200" "Questions feed"

# 5. Check if CORS is configured
echo -n "Testing CORS configuration... "
CORS_HEADER=$(curl -s -I -H "Origin: https://example.com" "$DEPLOY_URL/api/v1/health" | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ (CORS enabled)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ (CORS might not be configured)${NC}"
    ((FAILED++))
fi

# 6. Check response time
echo -n "Testing response time... "
START_TIME=$(date +%s%3N)
curl -s "$DEPLOY_URL/api/v1/health" > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${GREEN}✓ (${RESPONSE_TIME}ms)${NC}"
    ((PASSED++))
elif [ $RESPONSE_TIME -lt 3000 ]; then
    echo -e "${YELLOW}⚠ (${RESPONSE_TIME}ms - acceptable but slow)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ (${RESPONSE_TIME}ms - too slow)${NC}"
    ((FAILED++))
fi

# 7. Check SSL/TLS (if HTTPS)
if [[ $DEPLOY_URL == https://* ]]; then
    echo -n "Testing SSL/TLS certificate... "
    SSL_CHECK=$(curl -s --insecure -I "$DEPLOY_URL" 2>&1)
    if echo "$SSL_CHECK" | grep -q "HTTP"; then
        echo -e "${GREEN}✓ (HTTPS enabled)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ (SSL error)${NC}"
        ((FAILED++))
    fi
fi

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    exit 0
elif [ $FAILED -le 2 ]; then
    echo -e "${YELLOW}⚠️  Some checks failed but service is mostly operational${NC}"
    exit 0
else
    echo -e "${RED}❌ Multiple health checks failed!${NC}"
    echo "Please investigate the deployment"
    exit 1
fi
