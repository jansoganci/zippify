# Zippify Architecture Documentation

## System Overview

Zippify is a web application that helps users create optimized e-commerce listings using AI technology. The system follows a modern client-server architecture with a clear separation between frontend and backend components.

## System Components

![Zippify Architecture Diagram](https://i.imgur.com/XYZ123.png)

*Note: Replace the above image URL with an actual diagram of your system architecture.*

### Core Components

1. **Frontend (React + TypeScript)**
   - User Interface
   - State Management
   - API Client
   - Form Validation

2. **Backend (Node.js + Express)**
   - API Server
   - Authentication
   - AI Service Proxy
   - Database Access

3. **Database (SQLite)**
   - User Data
   - Listings
   - Usage Tracking

4. **External Services**
   - DeepSeek AI API
   - Google Image API
   - Each Labs API

## Component Interaction Flow

### Authentication Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Frontend │      │ Backend │      │ Database│
└────┬────┘      └────┬────┘      └────┬────┘
     │                │                 │
     │  Login Request │                 │
     │───────────────>│                 │
     │                │                 │
     │                │ Verify Credentials
     │                │────────────────>│
     │                │                 │
     │                │ User Data       │
     │                │<────────────────│
     │                │                 │
     │                │ Generate JWT    │
     │                │                 │
     │  JWT Token     │                 │
     │<───────────────│                 │
     │                │                 │
     │ Store Token    │                 │
     │                │                 │
```

### Listing Generation Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Frontend │      │ Backend │      │ DeepSeek│
└────┬────┘      └────┬────┘      └────┬────┘
     │                │                 │
     │ Listing Request│                 │
     │───────────────>│                 │
     │                │                 │
     │                │ Check Quota     │
     │                │                 │
     │                │ Format Prompt   │
     │                │                 │
     │                │ AI Request      │
     │                │────────────────>│
     │                │                 │
     │                │ AI Response     │
     │                │<────────────────│
     │                │                 │
     │                │ Process Response│
     │                │                 │
     │ Listing Data   │                 │
     │<───────────────│                 │
     │                │                 │
     │ Display Listing│                 │
     │                │                 │
```

## Frontend Architecture

The frontend follows a feature-based architecture with the following structure:

```
src/
├── components/       # Shared UI components
├── features/         # Feature modules
│   ├── auth/         # Authentication feature
│   ├── etsyListing/  # Etsy listing generation
│   ├── profile/      # User profile management
│   └── seo/          # SEO analysis tools
├── services/         # API and utility services
├── store/            # Global state management
└── utils/            # Helper functions
```

### Key Frontend Patterns

1. **Feature Modules**: Each major feature is encapsulated in its own directory with components, services, and state management.

2. **Service Layer**: API communication is abstracted through service modules that handle requests, responses, and error handling.

3. **Component Composition**: UI is built using composable components with clear responsibilities.

## Backend Architecture

The backend follows a modular architecture with middleware-based request processing:

```
backend/
├── controllers/      # Request handlers
├── middleware/       # Request processors
│   ├── auth.js       # Authentication middleware
│   ├── checkQuota.js # Usage limitation middleware
│   └── validate.js   # Request validation middleware
├── routes/           # API route definitions
│   ├── aiRoutes.js   # AI service routes
│   ├── authRoutes.js # Authentication routes
│   └── profileRoutes.js # User profile routes
├── services/         # Business logic and external service integration
├── utils/            # Helper functions
└── server.js         # Main application entry point
```

### Key Backend Patterns

1. **Middleware Chain**: Requests flow through a series of middleware functions for authentication, validation, and quota checking.

2. **Controller-Service Pattern**: Controllers handle HTTP concerns while services contain business logic.

3. **Route Modularization**: API routes are organized by feature area.

## API Proxy Architecture and CORS Solution

Zippify implements a backend proxy architecture to handle CORS issues and secure API keys when communicating with external services like DeepSeek AI.

### Problem Statement

1. **CORS Limitations**: Browsers prevent direct API calls to DeepSeek from the frontend due to missing CORS headers.
2. **API Key Security**: API keys should not be exposed in frontend code.
3. **URL Duplication**: The original implementation had issues with URL path duplication.

### Solution Architecture

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Frontend │      │ Backend │      │ DeepSeek│
└────┬────┘      └────┬────┘      └────┬────┘
     │                │                 │
     │ /api/ai/deepseek                 │
     │───────────────>│                 │
     │                │                 │
     │                │ Add API Key     │
     │                │                 │
     │                │ /v1/chat/completions
     │                │────────────────>│
     │                │                 │
     │                │ AI Response     │
     │                │<────────────────│
     │                │                 │
     │ Processed Data │                 │
     │<───────────────│                 │
     │                │                 │
```

### Implementation Details

1. **Frontend Implementation**:
   - Frontend components construct DeepSeek API request objects with system prompts and user prompts
   - These requests are sent to the backend proxy endpoint `/api/ai/deepseek`
   - The frontend maintains all business logic and prompt engineering

2. **Backend Implementation**:
   - A proxy endpoint `/api/ai/deepseek` receives all DeepSeek API requests
   - The backend adds the API key and forwards requests to DeepSeek
   - Responses are returned directly to the frontend
   - This approach resolves CORS issues while keeping API keys secure

3. **Backward Compatibility**:
   - The legacy endpoint `/api/deepseek` is maintained but redirects to `/api/ai/deepseek`
   - This ensures existing code continues to work while new code uses the standardized path

### Benefits of This Approach

1. **Security**: API keys remain secure on the server
2. **CORS Compliance**: All requests comply with browser security policies
3. **Flexibility**: The backend can add additional processing, logging, or rate limiting
4. **Standardization**: API routes follow a consistent pattern (`/api/ai/{provider}`)

## Database Schema

Zippify uses SQLite for data storage with the following schema:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│     users     │     │    profiles   │     │    listings   │
├───────────────┤     ├───────────────┤     ├───────────────┤
│ id            │─────┤ user_id       │     │ id            │
│ email         │     │ name          │     │ user_id       │
│ password_hash │     │ preferences   │     │ title         │
│ plan          │     │ created_at    │     │ description   │
│ created_at    │     └───────────────┘     │ tags          │
└───────────────┘                           │ platform      │
        │                                    │ created_at    │
        │                                    └───────────────┘
        │
        │     ┌───────────────┐
        │     │  user_quota   │
        └─────┤ user_id       │
              │ feature_key   │
              │ count         │
              │ last_reset    │
              └───────────────┘
```

## Environment Configuration

Zippify uses a dual environment configuration approach:

1. **Backend (Node.js)**: Uses `process.env` for environment variables
2. **Frontend (Vite)**: Uses `import.meta.env` for environment variables with `VITE_` prefix

### Configuration Management

The application includes a unified approach in `apiClient.js` that:
- Detects the runtime environment (browser vs Node.js)
- Uses the appropriate method to access environment variables
- Provides consistent defaults
- Handles type conversion

## Security Architecture

1. **Authentication**: JWT-based authentication with token expiration
2. **Authorization**: Role-based access control for protected routes
3. **Data Protection**: Input validation and sanitization
4. **API Security**: Rate limiting and quota enforcement
5. **Error Handling**: Secure error responses that don't leak sensitive information

## Performance Considerations

1. **Caching**: Response caching for frequently accessed data
2. **Compression**: HTTP compression for reduced payload sizes
3. **Pagination**: Result pagination for large data sets
4. **Asynchronous Processing**: Non-blocking I/O for handling concurrent requests

## Future Architecture Considerations

1. **Microservices**: Potential migration to microservices for specific features
2. **Cloud Deployment**: Containerization and cloud-native deployment
3. **Real-time Features**: WebSocket integration for real-time collaboration
4. **Analytics Pipeline**: Data collection and analysis for user behavior

## References

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [DeepSeek AI API Documentation](https://platform.deepseek.com/docs)
- [JWT Authentication Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
