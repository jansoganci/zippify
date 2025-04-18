# Zippify

Do you know, I added CI/CD to this project?!!!??
Today, 18.04.2025, I added CI/CD to this project. During the process, I encountered some issues with the workflow file.

## Project Description

Zippify is an application designed for e-commerce sellers to automate their product listing process. Users simply upload raw product information, and Zippify generates optimized product descriptions, enhanced product images, and downloadable ZIP files ready for immediate use.

## Technology Stack
- **Frontend**: React with TypeScript, Vite as build tool
- **UI Framework**: TailwindCSS
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Text Generation API**: DeepSeek API
- **Image Processing API**: Google Image-to-Image API
- **Authentication**: JWT-based authentication

## Project Structure

```
/zippify
├── /src
│   ├── /components          # UI components
│   │   └── /ui              # Reusable UI components
│   ├── /pages               # Application pages/routes
│   ├── /services            # API services
│   │   ├── /api             # API client configuration
│   │   ├── /auth            # Authentication services
│   │   ├── /deepseek        # DeepSeek API integration
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