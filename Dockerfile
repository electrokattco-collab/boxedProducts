# ============================================================================
# Boxed Sneakers - Production Dockerfile for Coolify
# Multi-stage build with optimized caching and security
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------------------------------
FROM node:18.20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies (if needed for native modules)
RUN apk add --no-cache dumb-init

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
# --omit=dev since we only need deps for the build script
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output exists
RUN test -f dist/index.html || (echo "Build failed: index.html not found" && exit 1)

# ----------------------------------------------------------------------------
# Stage 2: Production Stage with Nginx
# ----------------------------------------------------------------------------
FROM nginx:1.25-alpine

# Add labels for Coolify and metadata
LABEL maintainer="Boxed Sneakers Team"
LABEL description="Boxed Sneakers E-commerce Platform"
LABEL version="1.0.0"
LABEL coolify.deployment="true"

# Install wget for healthcheck (curl not available in alpine)
RUN apk add --no-cache --update wget && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder --chown=nginx-user:nginx-group /app/dist /usr/share/nginx/html

# Set correct permissions
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 80
EXPOSE 80

# Health check with Coolify-compatible settings
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
