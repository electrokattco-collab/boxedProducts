#!/bin/bash
# ============================================================================
# Verify Firebase Hosting Setup
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "=========================================="
echo "Firebase Hosting Setup Verification"
echo "=========================================="
echo ""

# Check Firebase CLI
echo "Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    check_pass "Firebase CLI installed"
    firebase --version
else
    check_fail "Firebase CLI not found"
    echo "  Run: npm install -g firebase-tools"
fi
echo ""

# Check .firebaserc
echo "Checking .firebaserc..."
if [ -f ".firebaserc" ]; then
    check_pass ".firebaserc exists"
    cat .firebaserc
else
    check_fail ".firebaserc missing"
fi
echo ""

# Check firebase.json
echo "Checking firebase.json..."
if [ -f "firebase.json" ]; then
    check_pass "firebase.json exists"
    
    # Check for rewrites
    if grep -q '"rewrites"' firebase.json; then
        check_pass "URL rewrites configured"
    else
        check_warn "URL rewrites not found"
    fi
    
    # Check for headers
    if grep -q '"headers"' firebase.json; then
        check_pass "Custom headers configured"
    else
        check_warn "Custom headers not found"
    fi
else
    check_fail "firebase.json missing"
fi
echo ""

# Check dist folder
echo "Checking dist/ folder..."
if [ -d "dist" ]; then
    check_pass "dist/ folder exists"
    
    if [ -f "dist/index.html" ]; then
        check_pass "dist/index.html exists"
    else
        check_fail "dist/index.html missing - run: npm run build"
    fi
    
    FILE_COUNT=$(find dist/ -type f | wc -l)
    echo "  Files in dist/: $FILE_COUNT"
else
    check_fail "dist/ folder missing - run: npm run build"
fi
echo ""

# Check Firebase login
echo "Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    check_pass "Authenticated with Firebase"
    
    # Check project
    if grep -q '"boxedsneakers"' .firebaserc; then
        check_pass "Project set to: boxedsneakers"
    fi
else
    check_fail "Not authenticated"
    echo "  Run: firebase login"
fi
echo ""

# Check GitHub Actions
echo "Checking CI/CD configuration..."
if [ -f ".github/workflows/firebase-hosting.yml" ]; then
    check_pass "GitHub Actions workflow configured"
else
    check_warn "GitHub Actions workflow not found (optional)"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "If all checks passed, you're ready to deploy!"
echo ""
echo "Run: firebase deploy --only hosting"
echo ""
echo "⚠️  Remember to add authorized domains after deployment:"
echo "   https://console.firebase.google.com/project/boxedsneakers/authentication"
echo ""
