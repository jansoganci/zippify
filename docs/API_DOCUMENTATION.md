# Zippify API Documentation

## ⚡ Endpoint Standards & Best Practices

### 🎯 Overview

Zippify follows industry-standard API practices to ensure consistent behavior across development and production environments. This section documents the proper endpoint configuration that ensures reliability and maintainability.

### 🏗️ Architecture Pattern

**Unified Endpoint Structure**: All API calls use the same path structure regardless of environment

```javascript
// ✅ CORRECT: Same endpoint structure everywhere
frontend -> /api/auth/login -> backend /api/auth/login
frontend -> /api/profile    -> backend /api/profile  
frontend -> /api/listings   -> backend /api/listings
```

### 🔧 Configuration

#### Frontend Configuration (`src/services/api/apiClient.js`)

```javascript
// ✅ STANDARD CONFIGURATION
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Development: Use Vite proxy
  : import.meta.env.VITE_API_URL || '/api';  // Production: Use env variable
```

#### Development Environment

```bash
# Frontend
http://localhost:8080

# API Calls (Frontend → Backend via Proxy)
GET /api/health       → http://localhost:3001/api/health
POST /api/auth/login  → http://localhost:3001/api/auth/login
GET /api/profile      → http://localhost:3001/api/profile
```

**Vite Proxy Configuration** (`vite.config.ts`):
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

#### Production Environment

```bash
# Frontend & API
https://yourdomain.com

# API Calls (Direct)
GET /api/health       → https://yourdomain.com/api/health
POST /api/auth/login  → https://yourdomain.com/api/auth/login
GET /api/profile      → https://yourdomain.com/api/profile
```

### 🛡️ Security Standards

1. **HTTPS Enforcement**: All production endpoints must use HTTPS
2. **CORS Configuration**: Properly configured for all environments
3. **Authentication**: JWT tokens in Authorization header
4. **Rate Limiting**: Implemented per user plan

### 📦 Environment Variables

#### Development (.env)
```bash
VITE_API_URL=/api  # Not used in dev (proxy handles routing)
NODE_ENV=development
```

#### Production (.env.production)
```bash
VITE_API_URL=/api  # Direct API calls to same domain
NODE_ENV=production
```

### 🔍 Debugging & Monitoring

#### Request Logging (Development Only)
```javascript
// Logs format: [API] METHOD baseURL+endpoint
// Example: [API] POST /api/auth/login
devLog(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
```

#### Health Check Endpoint
```bash
# Development
curl http://localhost:8080/api/health

# Production  
curl https://yourdomain.com/api/health
```

### ✅ Benefits of This Standard

1. **Consistency**: Same code works in dev and production
2. **Maintainability**: Single source of truth for endpoints
3. **Scalability**: Easy to add new endpoints
4. **Debugging**: Clear request logging and error handling
5. **Security**: Proper CORS and HTTPS configuration

### 🚨 Common Pitfalls to Avoid

❌ **WRONG**: Hardcoded URLs
```javascript
const response = await axios.post('http://localhost:3001/auth/login');
```

❌ **WRONG**: Different endpoints for dev/prod
```javascript
const endpoint = isDev ? '/auth/login' : '/api/auth/login';
```

❌ **WRONG**: Manual URL concatenation
```javascript
const url = baseURL + '/api' + endpoint;
```

✅ **CORRECT**: Standardized configuration
```javascript
const response = await apiClient.post('/auth/login');
```

---

## Overview

This document provides detailed information about the Zippify API endpoints, request/response formats, and authentication requirements. Zippify's API allows you to programmatically create product listings, analyze SEO keywords, and edit product images.

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://listify.digital/api`

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT).

### How to Authenticate

1. Obtain a JWT token by calling the login endpoint
2. Include the token in the Authorization header of subsequent requests:

```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration

- Access tokens expire after 24 hours
- When a token expires, you need to authenticate again

## Rate Limiting

API requests are subject to rate limiting based on the user's plan:

- **Free Plan**: 
  - 5 listing generations per day
  - 5 SEO analyses per day
  - 5 image edits per day

- **Premium Plan**:
  - 50 listing generations per day
  - 50 SEO analyses per day
  - 50 image edits per day

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Quota exceeded or insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses follow this format:

```json
{
  "error": "Error message description",
  "requestId": "req-1234567890",
  "details": { /* Additional error details */ }
}
```

## Endpoints

### Authentication

#### Register a New User

```
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "userId": 123
}
```

#### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "free"
  }
}
```

### User Profile

#### Get Current User Profile

```
GET /profile
```

**Authentication Required**: Yes

**Response:**

```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "free",
  "createdAt": "2025-01-15T12:00:00Z",
  "preferences": {
    "theme": "light",
    "notifications": true
  }
}
```

#### Update User Profile

```
PUT /profile
```

**Authentication Required**: Yes

**Request Body:**

```json
{
  "name": "John Smith",
  "preferences": {
    "theme": "dark"
  }
}
```

**Response:**

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": 123,
    "name": "John Smith",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

### Listing Generation

#### Generate Etsy Listing

```
POST /generate-etsy
```

**Authentication Required**: Yes

**Request Body:**

```json
{
  "productDescription": "Handmade linen apron with front pockets, perfect for bakers and gardeners",
  "keywords": ["linen apron", "kitchen apron", "gardening apron", "handmade apron"]
}
```

**Response:**

```json
{
  "title": "Handmade Linen Apron with Pockets – Baking & Gardening Apron – Kitchen or Garden Essential",
  "description": "**Handmade Linen Apron with Front Pockets – Perfect for Bakers & Gardeners**\n\nAdd a touch of rustic charm to your kitchen or garden with this **handmade linen apron**...",
  "tags": [
    "linen baking apron",
    "handmade kitchen apron",
    "gardening apron pockets",
    "rustic linen apron",
    "baker gift apron"
  ],
  "altTexts": [
    "Handmade linen apron with deep front pockets, ideal for baking or gardening in style.",
    "Stylish and durable linen apron with roomy pockets, perfect for keeping tools close while cooking.",
    "Comfortable handmade apron in natural linen, worn while kneading dough in a rustic kitchen."
  ]
}
```

#### Save Listing

```
POST /save-listing
```

**Authentication Required**: Yes

**Request Body:**

```json
{
  "title": "Handmade Linen Apron with Pockets – Baking & Gardening Apron",
  "description": "**Handmade Linen Apron with Front Pockets – Perfect for Bakers & Gardeners**...",
  "tags": ["linen baking apron", "handmade kitchen apron", "gardening apron pockets"],
  "altTexts": ["Handmade linen apron with deep front pockets, ideal for baking or gardening in style."],
  "originalPrompt": "Handmade linen apron with front pockets, perfect for bakers and gardeners",
  "platform": "etsy"
}
```

**Response:**

```json
{
  "message": "Listing saved successfully",
  "listingId": 456,
  "title": "Handmade Linen Apron with Pockets – Baking & Gardening Apron"
}
```

#### Get User Listings

```
GET /listings
```

**Authentication Required**: Yes

**Response:**

```json
{
  "listings": [
    {
      "id": 456,
      "title": "Handmade Linen Apron with Pockets – Baking & Gardening Apron",
      "platform": "etsy",
      "createdAt": "2025-04-22T08:30:00Z",
      "tags": ["linen baking apron", "handmade kitchen apron", "gardening apron pockets"]
    }
  ],
  "total": 1
}
```

### SEO Analysis

#### Analyze Keywords

```
GET /keywords/analyze?query=linen+apron
```

**Authentication Required**: Yes

**Query Parameters:**
- `query`: The keyword or phrase to analyze

**Response:**

```json
{
  "keyword": "linen apron",
  "volume": 2400,
  "difficulty": 35,
  "cpc": 0.75,
  "relatedKeywords": [
    {
      "keyword": "linen cooking apron",
      "volume": 1200,
      "difficulty": 25
    },
    {
      "keyword": "handmade linen apron",
      "volume": 890,
      "difficulty": 30
    }
  ],
  "suggestions": [
    "Consider targeting 'handmade linen apron' for better conversion rates",
    "Include 'kitchen linen apron' in your tags for broader reach"
  ]
}
```

### Image Editing

#### Edit Product Image

```
POST /edit-image
```

**Authentication Required**: Yes

**Request Body (multipart/form-data):**
- `image`: The image file to edit
- `instructions`: Text instructions for editing (e.g., "Remove background and enhance colors")
- `preset`: Optional preset to apply (e.g., "product_white_background")

**Response:**

```json
{
  "editedImageUrl": "https://listify.digital/storage/edited_images/image_123456.jpg",
  "expiresAt": "2025-04-23T08:30:00Z",
  "originalFilename": "my_product.jpg"
}
```

### AI Integration

#### Proxy to DeepSeek AI

```
POST /ai/deepseek
```

**Authentication Required**: Yes

**Request Body:**

```json
{
  "system": "You are a helpful assistant that generates product descriptions.",
  "prompt": "Write a description for a handmade linen apron with front pockets.",
  "featureKey": "create-listing"
}
```

**Response:**

```json
{
  "content": "# Handmade Linen Apron with Front Pockets\n\nIntroducing our premium handmade linen apron, crafted with care for both function and style...",
  "raw": {
    "choices": [
      {
        "message": {
          "content": "# Handmade Linen Apron with Front Pockets\n\nIntroducing our premium handmade linen apron...",
          "role": "assistant"
        }
      }
    ]
  }
}
```

### Quota Management

#### Increment Usage Quota

```
POST /increment-quota
```

**Authentication Required**: Yes

**Request Body:**

```json
{
  "featureKey": "create-listing"
}
```

**Response:**

```json
{
  "message": "Quota incremented successfully",
  "feature": "create-listing",
  "newCount": 3,
  "limit": 5,
  "remaining": 2
}
```

### Utility Endpoints

#### Health Check

```
GET /health
```

**Authentication Required**: No

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

## Webhooks

Zippify does not currently support webhooks.

## SDK

Zippify does not currently provide an official SDK.

## Support

For API support, please contact support@listify.digital or open an issue on our GitHub repository.
