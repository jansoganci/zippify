# Zippify Deployment Guide

This document provides comprehensive instructions for deploying the Zippify application to production environments. It covers environment setup, build processes, database configuration, and monitoring.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Building the Application](#building-the-application)
- [Deployment Options](#deployment-options)
  - [Traditional Server Deployment](#traditional-server-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying Zippify, ensure you have:

- Node.js (v16+)
- npm or yarn
- Git
- SQLite (for database)
- API keys for required services:
  - DeepSeek AI
  - Google Image API (if using image features)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zippify.git
cd zippify
```

### 2. Create Production Environment Files

Create `.env.production` in the root directory:

```
# API Configuration
VITE_API_URL=https://your-production-domain.com/api
VITE_ENABLE_MOCK_MODE=false
VITE_ENABLE_DEBUG_LOGGING=false
VITE_APP_NAME=Zippify
VITE_DEFAULT_AI_PROVIDER=deepseek
```

Create `.env` in the backend directory:

```
# API Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your-production-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4096
DEEPSEEK_MAX_RETRIES=3
DEEPSEEK_RETRY_DELAY=3000
DEEPSEEK_TIMEOUT=60000
DEEPSEEK_RATE_LIMIT=10

# Security Settings
NODE_ENV=production
JWT_SECRET=your-strong-production-secret
JWT_EXPIRY=24h
SECURE_COOKIES=true
CORS_ORIGIN=https://your-production-domain.com
SSL_ENABLED=true

# Performance Settings
COMPRESSION_ENABLED=true
CACHE_TTL=3600
MAX_PAYLOAD_SIZE=50mb

# Monitoring
ENABLE_LOGGING=true
LOG_LEVEL=warn

# Feature Flags
ENABLE_MOCK_MODE=false
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
```

### 3. Security Considerations

For production environments:

- Use a strong, unique JWT_SECRET
- Enable HTTPS (SSL_ENABLED=true)
- Set SECURE_COOKIES=true
- Restrict CORS_ORIGIN to your domain
- Use environment-specific API keys

## Database Setup

### 1. Initialize the Production Database

```bash
cd backend
NODE_ENV=production node initDb.js
```

### 2. Database Migrations

If you're upgrading from a previous version:

```bash
NODE_ENV=production node migrations/runMigrations.js
```

### 3. Database Backup Strategy

Set up a regular backup schedule:

```bash
# Example cron job for daily backups
0 2 * * * cd /path/to/zippify/backend && ./scripts/backup-database.sh
```

## Building the Application

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Build the Frontend

```bash
# Production build
npm run build
```

This creates optimized production files in the `dist` directory.

### 3. Prepare the Backend

```bash
cd backend
npm run build
```

## Deployment Options

### Traditional Server Deployment

#### 1. Nginx Configuration

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-production-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-production-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend static files
    location / {
        root /path/to/zippify/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. Start the Backend Server

Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start the backend
cd backend
pm2 start server.js --name zippify-backend

# Ensure PM2 starts on system boot
pm2 startup
pm2 save
```

### Docker Deployment

#### 1. Create a Dockerfile

```dockerfile
# Frontend build stage
FROM node:16 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend build stage
FROM node:16 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./

# Final stage
FROM node:16-alpine
WORKDIR /app
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "backend/server.js"]
```

#### 2. Build and Run Docker Container

```bash
# Build the Docker image
docker build -t zippify:latest .

# Run the container
docker run -d -p 3001:3001 --name zippify \
  --env-file ./backend/.env \
  -v zippify-data:/app/backend/data \
  zippify:latest
```

### Cloud Platform Deployment

#### Deploying to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a Heroku app
heroku create zippify-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# Set other environment variables...

# Deploy to Heroku
git push heroku main
```

#### Deploying to AWS Elastic Beanstalk

1. Create an `Procfile` in the root directory:

```
web: node backend/server.js
```

2. Use the AWS Management Console or AWS CLI to deploy.

## Post-Deployment Verification

### 1. Verify API Endpoints

```bash
# Check health endpoint
curl https://your-production-domain.com/api/health

# Verify authentication
curl -X POST https://your-production-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. Frontend Verification

- Open https://your-production-domain.com in a browser
- Verify login functionality
- Test listing generation
- Check SEO analysis
- Test image editing

### 3. Security Verification

- Run an SSL check: https://www.ssllabs.com/ssltest/
- Verify CORS settings
- Ensure API keys are not exposed

## Monitoring and Maintenance

### 1. Logging

Configure a logging service like Papertrail or ELK Stack:

```bash
# Example: Install Winston for logging
npm install winston

# Configure Winston in your backend
```

### 2. Performance Monitoring

Set up monitoring with tools like:

- New Relic
- Datadog
- Prometheus + Grafana

### 3. Regular Maintenance Tasks

- Database cleanup
- Log rotation
- Security updates
- Dependency updates

## Backup and Recovery

### 1. Database Backup

Create a backup script:

```bash
#!/bin/bash
# backup-database.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
mkdir -p $BACKUP_DIR
cp /path/to/zippify/backend/data/database.sqlite $BACKUP_DIR/database_$TIMESTAMP.sqlite
# Optional: compress the backup
gzip $BACKUP_DIR/database_$TIMESTAMP.sqlite
# Optional: upload to cloud storage
# aws s3 cp $BACKUP_DIR/database_$TIMESTAMP.sqlite.gz s3://your-bucket/backups/
```

### 2. Recovery Procedure

```bash
# Stop the application
pm2 stop zippify-backend

# Restore the database
cp /path/to/backups/database_20250415_120000.sqlite /path/to/zippify/backend/data/database.sqlite

# Restart the application
pm2 start zippify-backend
```

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start

Check:
- Environment variables
- Database file permissions
- Port availability

#### 502 Bad Gateway

Check:
- Backend server is running
- Nginx configuration
- Firewall settings

#### Authentication Issues

Check:
- JWT_SECRET is correctly set
- Token expiration settings
- CORS configuration

#### Slow Performance

Check:
- Database indexes
- API rate limiting
- Server resources

### Getting Help

If you encounter issues not covered in this guide:

1. Check the logs: `pm2 logs zippify-backend`
2. Review the [GitHub issues](https://github.com/yourusername/zippify/issues)
3. Contact support at support@listify.digital
