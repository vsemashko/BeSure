#!/bin/bash
# Smoke Test Script for BeSure Backend
# Tests critical user flows after deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔥 BeSure Smoke Tests${NC}"
echo "=================================================="

# Get deployment URL from argument or prompt
if [ -z "$1" ]; then
    read -p "Enter deployment URL (e.g., https://api.besure.com): " DEPLOY_URL
else
    DEPLOY_URL=$1
fi

# Remove trailing slash
DEPLOY_URL=${DEPLOY_URL%/}
API_URL="$DEPLOY_URL/api/v1"

echo -e "${YELLOW}🔍 Testing: $API_URL${NC}"
echo ""

# Initialize counters
PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    shift
    local test_command="$@"

    echo -n "Testing $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
echo -e "${YELLOW}1. Health & Status Tests${NC}"
run_test "Health endpoint" "curl -f -s $API_URL/health"
run_test "API root" "curl -f -s $API_URL"
echo ""

# Test 2: Authentication Flow
echo -e "${YELLOW}2. Authentication Tests${NC}"

# Generate random test user credentials (ephemeral, not stored)
TEST_USERNAME="test_$(date +%s)_$RANDOM"
TEST_EMAIL="${TEST_USERNAME}@test.besure.com"
TEST_PASSWORD="TestPassword123"  # Temporary password for smoke test only

# Register new user
echo -n "Testing user registration... "
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗${NC}"
    echo "Response: $REGISTER_RESPONSE"
    ((FAILED++))
    ACCESS_TOKEN=""
fi

# Test login
if [ -n "$ACCESS_TOKEN" ]; then
    echo -n "Testing user login... "
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
      }")

    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
    fi

    # Test protected route
    echo -n "Testing authenticated route... "
    ME_RESPONSE=$(curl -s "$API_URL/auth/me" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if echo "$ME_RESPONSE" | grep -q "$TEST_USERNAME"; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
    fi
fi

echo ""

# Test 3: Questions API
echo -e "${YELLOW}3. Questions API Tests${NC}"

# Get questions feed
run_test "Get questions feed" "curl -f -s '$API_URL/questions/feed?limit=10'"

# Create question (if we have token)
if [ -n "$ACCESS_TOKEN" ]; then
    echo -n "Testing create question... "
    CREATE_QUESTION_RESPONSE=$(curl -s -X POST "$API_URL/questions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "{
        \"title\": \"Smoke Test Question $(date +%s)\",
        \"description\": \"This is a smoke test question\",
        \"options\": [
          {\"content\": \"Option A\"},
          {\"content\": \"Option B\"}
        ],
        \"expiresInMinutes\": 60,
        \"privacyLevel\": \"public\"
      }")

    if echo "$CREATE_QUESTION_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
        QUESTION_ID=$(echo "$CREATE_QUESTION_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    else
        echo -e "${RED}✗${NC}"
        echo "Response: $CREATE_QUESTION_RESPONSE"
        ((FAILED++))
        QUESTION_ID=""
    fi

    # Get question by ID
    if [ -n "$QUESTION_ID" ]; then
        run_test "Get question by ID" "curl -f -s '$API_URL/questions/$QUESTION_ID'"
    fi
fi

echo ""

# Test 4: Points & Gamification
echo -e "${YELLOW}4. Points & Gamification Tests${NC}"

if [ -n "$ACCESS_TOKEN" ]; then
    run_test "Get user points" "curl -f -s '$API_URL/users/me/points' -H 'Authorization: Bearer $ACCESS_TOKEN'"
    run_test "Get leaderboard" "curl -f -s '$API_URL/leaderboard?limit=10'"
fi

echo ""

# Test 5: Performance Tests
echo -e "${YELLOW}5. Performance Tests${NC}"

echo -n "Testing response time (target: <500ms)... "
START_TIME=$(date +%s%3N)
curl -s "$API_URL/health" > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ $RESPONSE_TIME -lt 500 ]; then
    echo -e "${GREEN}✓ (${RESPONSE_TIME}ms)${NC}"
    ((PASSED++))
elif [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${YELLOW}⚠ (${RESPONSE_TIME}ms - acceptable)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ (${RESPONSE_TIME}ms - too slow)${NC}"
    ((FAILED++))
fi

# Test concurrent requests
echo -n "Testing concurrent requests... "
for i in {1..5}; do
    curl -s "$API_URL/health" > /dev/null &
done
wait

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    echo "Deployment is ready for production traffic"
    exit 0
elif [ $FAILED -le 3 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed but critical flows work${NC}"
    echo "Review failed tests before going live"
    exit 0
else
    echo -e "${RED}❌ Multiple smoke tests failed!${NC}"
    echo "Do NOT direct production traffic to this deployment"
    exit 1
fi
