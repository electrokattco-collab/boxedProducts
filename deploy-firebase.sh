#!/bin/bash
# ============================================================================
# Boxed Sneakers - Firebase Hosting Deployment Script
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Pre-deployment Checks
# ============================================================================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi
    
    # Check if logged in
    if ! firebase projects:list &> /dev/null; then
        log_warning "Not logged in to Firebase"
        log_info "Running: firebase login"
        firebase login
    fi
    
    # Check project
    if [ ! -f ".firebaserc" ]; then
        log_error ".firebaserc not found. Creating..."
        echo '{"projects":{"default":"boxedsneakers"}}' > .firebaserc
    fi
    
    log_success "Prerequisites check passed"
}

# ============================================================================
# Build Project
# ============================================================================

build_project() {
    log_info "Building project..."
    
    # Clean install
    npm ci --no-audit --no-fund
    
    # Build
    npm run build
    
    # Optimize (if available)
    npm run optimize 2>/dev/null || log_warning "Optimization skipped"
    
    log_success "Build completed"
}

# ============================================================================
# Deploy to Firebase
# ============================================================================

deploy_firebase() {
    log_info "Deploying to Firebase Hosting..."
    
    # Deploy
    firebase deploy --only hosting
    
    log_success "Deployment completed!"
}

# ============================================================================
# Post-deployment
# ============================================================================

post_deployment() {
    log_info "Post-deployment steps..."
    
    # Get hosting URL
    log_info "Your site is live at:"
    log_info "  https://boxedsneakers.web.app"
    log_info "  https://boxedsneakers.firebaseapp.com"
    
    echo ""
    log_warning "IMPORTANT: Add these domains to Firebase Auth authorized domains:"
    log_info "1. Go to: https://console.firebase.google.com/project/boxedsneakers/authentication"
    log_info "2. Click Settings → Authorized domains"
    log_info "3. Add: boxedsneakers.web.app"
    log_info "4. Add: boxedsneakers.firebaseapp.com"
}

# ============================================================================
# Main
# ============================================================================

main() {
    echo "=========================================="
    echo "Boxed Sneakers - Firebase Hosting Deploy"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    build_project
    deploy_firebase
    post_deployment
    
    echo ""
    log_success "All done! 🎉"
}

# Run main function
main "$@"
