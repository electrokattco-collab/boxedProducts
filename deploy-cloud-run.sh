#!/bin/bash
# ============================================================================
# Boxed Sneakers - Cloud Run Deployment Script
# ============================================================================

set -e  # Exit on error

# Configuration
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}
REGION=${REGION:-us-central1}
REPOSITORY=${REPOSITORY:-boxed-sneakers-repo}
SERVICE_NAME=${SERVICE_NAME:-boxed-sneakers}
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/boxed-sneakers"

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
    
    # Check gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        log_error "Not logged in to gcloud. Run: gcloud auth login"
        exit 1
    fi
    
    # Check project is set
    if [ -z "$PROJECT_ID" ]; then
        log_error "No project ID set. Run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# ============================================================================
# Enable APIs
# ============================================================================

enable_apis() {
    log_info "Enabling required Google Cloud APIs..."
    
    gcloud services enable run.googleapis.com \
        artifactregistry.googleapis.com \
        cloudbuild.googleapis.com \
        firestore.googleapis.com \
        identitytoolkit.googleapis.com \
        --quiet
    
    log_success "APIs enabled"
}

# ============================================================================
# Create Artifact Registry
# ============================================================================

create_artifact_registry() {
    log_info "Creating Artifact Registry repository..."
    
    if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &> /dev/null; then
        gcloud artifacts repositories create $REPOSITORY \
            --repository-format=docker \
            --location=$REGION \
            --description="Boxed Sneakers container images"
        log_success "Artifact Registry created"
    else
        log_warning "Artifact Registry already exists"
    fi
    
    # Configure Docker authentication
    gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
}

# ============================================================================
# Create Service Account
# ============================================================================

create_service_account() {
    log_info "Creating service account..."
    
    SA_NAME="boxed-sneakers-sa"
    SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    if ! gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
        gcloud iam service-accounts create $SA_NAME \
            --display-name="Boxed Sneakers Cloud Run SA"
        log_success "Service account created"
    else
        log_warning "Service account already exists"
    fi
    
    # Grant permissions
    log_info "Granting permissions to service account..."
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/datastore.user" \
        --quiet || true
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/storage.objectViewer" \
        --quiet || true
    
    log_success "Permissions granted"
}

# ============================================================================
# Build Container
# ============================================================================

build_container() {
    log_info "Building container image..."
    
    docker build -f Dockerfile.cloudrun -t $IMAGE_NAME:latest .
    
    log_success "Container built"
}

# ============================================================================
# Push Container
# ============================================================================

push_container() {
    log_info "Pushing container to Artifact Registry..."
    
    docker push $IMAGE_NAME:latest
    
    log_success "Container pushed"
}

# ============================================================================
# Deploy to Cloud Run
# ============================================================================

deploy_cloud_run() {
    log_info "Deploying to Cloud Run..."
    
    SA_EMAIL="boxed-sneakers-sa@$PROJECT_ID.iam.gserviceaccount.com"
    
    gcloud run deploy $SERVICE_NAME \
        --image=$IMAGE_NAME:latest \
        --region=$REGION \
        --platform=managed \
        --port=8080 \
        --memory=256Mi \
        --cpu=1 \
        --concurrency=1000 \
        --max-instances=100 \
        --min-instances=0 \
        --timeout=300 \
        --ingress=all \
        --allow-unauthenticated \
        --service-account=$SA_EMAIL \
        --set-env-vars=NODE_ENV=production \
        --health-check-path=/health
    
    log_success "Deployed to Cloud Run"
}

# ============================================================================
# Verify Deployment
# ============================================================================

verify_deployment() {
    log_info "Verifying deployment..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    
    log_info "Service URL: $SERVICE_URL"
    
    # Check health endpoint
    if curl -s -f "$SERVICE_URL/health" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Check main page
    if curl -s -f "$SERVICE_URL/" > /dev/null; then
        log_success "Main page accessible"
    else
        log_error "Main page not accessible"
        exit 1
    fi
    
    log_success "Deployment verified successfully!"
    echo ""
    echo "=========================================="
    echo "Your application is live at:"
    echo "$SERVICE_URL"
    echo "=========================================="
}

# ============================================================================
# Update Firebase Auth Domains
# ============================================================================

update_firebase_domains() {
    log_info "Updating Firebase Auth domains..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    DOMAIN=$(echo $SERVICE_URL | sed 's|https://||')
    
    log_warning "IMPORTANT: Add '$DOMAIN' to Firebase Console"
    log_info "1. Go to: https://console.firebase.google.com"
    log_info "2. Select project: boxedsneakers"
    log_info "3. Navigate to: Authentication → Settings → Authorized domains"
    log_info "4. Add: $DOMAIN"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    echo "=========================================="
    echo "Boxed Sneakers - Cloud Run Deployment"
    echo "=========================================="
    echo ""
    
    log_info "Project ID: $PROJECT_ID"
    log_info "Region: $REGION"
    log_info "Service: $SERVICE_NAME"
    echo ""
    
    check_prerequisites
    enable_apis
    create_artifact_registry
    create_service_account
    build_container
    push_container
    deploy_cloud_run
    verify_deployment
    update_firebase_domains
    
    echo ""
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@"
