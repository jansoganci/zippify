# Zippify

## Project Description

Zippify is a comprehensive e-commerce seller tool designed to automate and optimize product listing creation across multiple platforms. The application leverages AI to generate SEO-optimized product descriptions, enhance product images, and create downloadable assets ready for immediate use on platforms like Etsy..

## Key Features

- **AI-Powered Listing Generation**: Create optimized product listings with titles, descriptions, and tags
- **SEO Keyword Analysis**: Analyze keywords for search volume and competition
- **Image Enhancement**: Edit product images with AI to improve quality and appeal
- **Batch Processing**: Process multiple images with the same editing instructions
- **User Management**: Complete authentication system with JWT-based security
- **Quota Management**: Track and limit feature usage based on user plans
- **Cross-Platform Support**: Generate listings optimized for different e-commerce platforms

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **UI Framework**: TailwindCSS 3.3.5 with shadcn/ui components
- **Component Libraries**: Radix UI primitives
- **State Management**: React Query, React Context
- **Routing**: React Router Dom 7
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite with sqlite3/sqlite packages
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Logging**: Winston
- **AI Integration**: DeepSeek API, Google Generative AI
- **PDF Generation**: jsPDF, marked
- **Image Processing**: Sharp

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Automated deployment to VPS
- **Environment Management**: dotenv

## Project Structure

```
/zippify
├── /src                     # Frontend source code
│   ├── /components          # Shared UI components
│   │   └── /ui              # Reusable UI components (shadcn/ui)
│   ├── /features            # Feature-based modules
│   │   ├── /etsyListing     # Etsy listing generation
│   │   ├── /imageEditing    # Image editing functionality
│   │   ├── /listings        # Listing management
│   │   └── /seoAnalysis     # SEO keyword analysis
│   ├── /hooks               # Custom React hooks
│   ├── /lib                 # Utility libraries
│   ├── /pages               # Application pages/routes
│   └── /services            # API services
│       ├── /api             # API client
│       ├── /auth            # Authentication services
│       └── /deepseek        # DeepSeek AI integration
├── /backend                 # Backend source code
│   ├── /controllers         # Request handlers
│   ├── /middleware          # Express middleware
│   ├── /models              # Data models
│   ├── /routes              # API routes
│   ├── /src                 # Core backend logic
│   │   ├── /features        # Feature-specific logic
│   │   └── /services        # External service integrations
│   └── /utils               # Utility functions
├── /db                      # Database files
├── /docs                    # Documentation
└── /public                  # Static assets
```

## Installation and Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/jansoganci/zippify.git
   cd zippify
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   This will start both the frontend (http://localhost:8080) and backend (http://localhost:3001) servers.

### Production Deployment

1. Build the frontend
   ```bash
   npm run build
   ```

2. Deploy the application
   ```bash
   # The deployment process is handled by CI/CD
   git push origin master
   ```

## API Documentation

Detailed API documentation is available in the `/docs` directory:

- [API Documentation](/docs/API_DOCUMENTATION.md) - Comprehensive API endpoint reference
- [Architecture](/docs/ARCHITECTURE.md) - System architecture and component interactions
- [Deployment Guide](/docs/DEPLOYMENT.md) - Deployment instructions and configurations
- [User Guide](/docs/USER_GUIDE.md) - End-user documentation
- [Changelog](/docs/CHANGELOG.md) - Version history and updates

## Security

Zippify implements several security measures:

- JWT-based authentication with token expiration
- Password hashing using bcrypt
- Input validation and sanitization
- Rate limiting and quota enforcement
- Secure API key handling via backend proxy

## License

This project is proprietary software. All rights reserved.

## Contact

For support or inquiries, please contact support@listify.digital.
│   │   ├── /google-image    # Google Image API integration
│   │   └── /workflow        # Workflow services
│   ├── /hooks               # Custom React hooks
│   └── /lib                 # Utility libraries
├── /backend                 # Server-side implementation
│   └── server.js            # Express server
├── /db                      # SQLite database files
│   ├── schema.sql           # Database schema
│   └── zippify.db           # SQLite database
├── /public                  # Static assets
├── .windsurfrules           # Project guidelines
└── README.md                # Documentation
```

## SQLite Database Schema

### users
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- password (hashed)
- created_at

### profiles
- id (PK)
- user_id (FK)
- first_name
- last_name
- store_name

### listings
- id (PK)
- user_id (FK)
- title
- description
- keywords
- created_at

### files
- id (PK)
- listing_id (FK)
- file_url
- delete_at (Timestamp, auto-delete after 24h)

## Features

### User Features
- User registration and authentication
- Profile management
- Product listing creation and optimization
- Image enhancement
- Downloadable ZIP files with optimized content
- Listing management

### Admin Features
- User management
- Listing management
- System statistics monitoring

## UI/UX Specifications

### Layout Structure
- **Sidebar Navigation**: Collapsible sidebar (Dashboard, Create Listing, My Listings, Profile)
- **Header**: Fixed top bar (logo left, user profile avatar right)
- **Main Content**: Centered, clean layout
- **Landing Page**: Minimalistic landing page with title, call-to-action button, and brief description
- **Status Bar**: Visual representation of the current step in the workflow

### Design System
- **Color Palette**:
  - Primary: #4F46E5 (Buttons, Highlights)
  - Secondary: #F9FAFB (Background)
  - Text: #111827 (Main text)
  - Accent: #10B981 (Success notifications)
  - Error: #EF4444 (Error messages)
  - Dark Mode: Toggle between light and dark themes

- **Typography**:
  - Primary Font: Inter (Headings semi-bold, Body regular)
  - Sizes: Headings (18-24px), Body (14-16px), Small (12px)

- **Animations & Feedback**:
  - Smooth transitions between steps
  - Progress indicator for processing
  - Animated success and error messages

## Security & Privacy

- JWT-based authentication with secure token management
- User data (images, descriptions) stored temporarily for 24 hours
- Files automatically deleted after 24 hours
- Users notified explicitly about temporary storage

## Development Guidelines

- Modular component structure
- Clean code principles (DRY, KISS, Single Responsibility)
- Strict separation of concerns
- Comprehensive error handling
- Responsive design for all device sizes

## Performance Goals

- Complete process (submission → download) < 5 minutes
- Support for up to 50 concurrent users
- Daily limit of 20 listing generations per user

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

### Environment Variables
The application uses a dual environment setup:
- Backend: Uses `process.env`
- Frontend: Uses `import.meta.env` with `VITE_` prefix

Key variables include:
- `DEEPSEEK_API_KEY`: For text generation
- `GOOGLE_API_KEY`: For image processing
- `JWT_SECRET`: For authentication