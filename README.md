# Zippify

## Project Description
Zippify is an application designed for e-commerce sellers to automate their product listing process. Users simply upload raw product information, and Zippify generates optimized product descriptions, enhanced product images, and downloadable ZIP files ready for immediate use.

## Technology Stack
- **Frontend:** Windsurf (Low-code platform)
- **Database:** SQLite
- **Text Generation API:** DeepSeek API
- **PDF Generation API:** Eachlabs.ai API
- **Image Processing API:** Google Image-to-Image API
- **Payment Processing:** Stripe (Monthly subscription)

## Project Structure
/zippify
├── /src
│   ├── /components          # UI components
│   │   ├── /auth
│   │   ├── /dashboard
│   │   └── /profile
│   ├── /services            # API services
│   │   ├── /deepseek
│   │   ├── /eachlabs
│   │   └── /google-image
│   ├── /styles              # CSS files (modular)
│   ├── /utils               # Helper functions
│   ├── /hooks               # Custom hooks
│   └── /context             # Context providers
├── /db                      # SQLite database files
│   ├── schema.sql
│   └── zippify.db
├── .windsurfrules           # Project guidelines
└── README.md                # Documentation

## SQLite Database Schema

**users**
- user_id (PK)
- email
- username
- password (hashed)
- created_at

**profiles**
- profile_id (PK)
- user_id (FK)
- first_name
- last_name
- store_name
- profile_image_url (optional)

**listings**
- listing_id (PK)
- user_id (FK)
- product_title
- product_description
- keywords
- created_at

**files**
- file_id (PK)
- user_id (FK)
- listing_id (FK)
- zip_file_url
- created_at
- delete_at (Timestamp, auto-delete after 24h)

**logs**
- log_id (PK)
- user_id (FK)
- action TEXT
- status TEXT
- error_message TEXT
- created_at TIMESTAMP

## Admin Dashboard
- User Management
- Listing Management
- Log Monitoring
- System Statistics

## UI/UX Specifications

### Layout Structure:
- **Sidebar Navigation:** Collapsible sidebar (Dashboard, Create Listing, My Listings, Profile)
- **Header:** Fixed top bar (logo left, user profile avatar right)
- **Footer:** Fixed bottom bar (©2025 Zippify, Privacy Policy, Terms)
- **Main Content:** Centered, clean layout

### Color Palette:
- **Primary:** `#4F46E5` (Buttons, Highlights)
- **Secondary:** `#F9FAFB` (Background)
- **Text:** `#111827` (Main text)
- **Accent:** `#10B981` (Success notifications)
- **Error:** `#EF4444` (Error messages)

### Typography:
- **Primary Font:** Inter (Headings semi-bold, Body regular)
- **Secondary Font:** Roboto (alternative)
- **Sizes:** Headings (18-24px), Body (14-16px), Small (12px)

## Data Storage & Privacy
- User data (images, descriptions) stored temporarily for 24 hours.
- Automatically deleted after 24 hours.
- Inform users explicitly on upload and download pages.

## Success Metrics (MVP)
- Complete process (submission → download) < 5 minutes.
- ≥ 80% positive user feedback.
- Critical issues resolved within 24 hours.

## Project Timeline
- MVP Completion: Within next 3 hours
- Beta Testing: 3-5 users immediately after MVP