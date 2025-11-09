# MyAiPlug Setup Guide

Complete setup instructions for getting the MyAiPlug platform running locally or in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Feature Checklist](#feature-checklist)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17 or later) - [Download](https://nodejs.org/)
- **npm** (v9 or later) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version  # Should be v18.17 or higher
npm --version   # Should be v9 or higher
git --version   # Any recent version
```

---

## Quick Start

Get up and running in 3 simple steps:

```bash
# 1. Clone the repository
git clone https://github.com/myaiplug/Myaiplug.git
cd Myaiplug

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it!

---

## Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/myaiplug/Myaiplug.git
cd Myaiplug
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14.2.33
- React 18.3.1
- TypeScript 5.9.3
- Tailwind CSS 3.4.13
- Framer Motion 12.23.24
- Three.js 0.180.0
- And more...

### Step 3: Verify the Build

```bash
npm run build
```

This should complete without errors. If you see any errors, check the [Troubleshooting](#troubleshooting) section.

---

## Environment Configuration

Currently, the application uses in-memory storage for the backend services. No environment variables or database configuration is required for development.

### Future Configuration (when migrating to production database)

Create a `.env.local` file in the root directory:

```env
# Database (future)
DATABASE_URL=your_database_connection_string

# Authentication (future)
JWT_SECRET=your_secret_key_here

# External APIs (when AI features are connected)
OPENAI_API_KEY=your_openai_key
REPLICATE_API_KEY=your_replicate_key

# Storage (future)
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

**Note:** Currently, these are not required. The app works out of the box!

---

## Running the Application

### Development Mode

```bash
npm run dev
```

- Opens on [http://localhost:3000](http://localhost:3000)
- Auto-reloads on file changes
- TypeScript type-checking enabled
- Source maps for debugging

### Production Build

```bash
npm run build
npm start
```

- Optimized for performance
- Minified JavaScript/CSS
- Opens on [http://localhost:3000](http://localhost:3000)

### Linting

```bash
npm run lint
```

Checks code for common issues and style problems.

---

## Testing the Application

### 1. Create an Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Start Free" or "Sign Up"
3. Fill in:
   - Email: any valid email (e.g., `test@example.com`)
   - Handle: your username (e.g., `testuser`)
   - Password: at least 8 characters
4. Click "Create Account"
5. You'll be redirected to the dashboard

**Note:** No email verification is required in development. The account is created instantly!

### 2. Explore the Dashboard

After signing in, you can:

- **Dashboard** (`/dashboard`) - View your stats, recent jobs, and progress
- **Jobs** (`/dashboard/jobs`) - See all processed files
- **Portfolio** (`/dashboard/portfolio`) - Manage your public creations
- **Referrals** (`/dashboard/referrals`) - Get your referral link and track earnings
- **Profile** (`/profile`) - View your public profile
- **Settings** (`/settings`) - Update your profile information

### 3. Test Authentication

- Sign out using the logout button in the header
- Sign back in with your credentials
- Your session persists across page reloads
- Session tokens are stored in `localStorage`

### 4. Test the AI Playground

1. Scroll down on the homepage to "AI Playground"
2. Try the interactive demos:
   - **Album Art AI**: Generate cover art concepts
   - **YouTube to Social**: Convert video URLs to social media posts
3. Navigate between demos using the arrow buttons

**Note:** AI features currently show placeholder results. Real AI integration is marked as TODO for future implementation.

### 5. Test Audio Modules

1. Find the "Interactive Demo" section on the homepage
2. Play with the audio processing modules:
   - Warmth
   - Stereo Widener
   - EQ3
   - Reverb Lite
   - HalfScrew
   - reTUNE 432
3. Use A/B to compare dry vs. processed sound
4. Upload your own audio file (optional)
5. Record and download processed audio

---

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js and configure everything
5. Click "Deploy"

**That's it!** Your app will be live in minutes.

### Deploy to Other Platforms

#### Netlify

```bash
npm run build
# Upload the .next folder to Netlify
```

#### AWS/GCP/Azure

```bash
npm run build
npm start
# Configure your cloud provider to run this command
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 is already in use"**
```bash
# Solution: Use a different port
PORT=3001 npm run dev
```

**Error: "TypeScript compilation errors"**
```bash
# Solution: Check for syntax errors in your code
npm run lint
# Fix any reported issues
```

### Runtime Errors

**Error: "Session not found" or constant logouts**
- Clear your browser's localStorage
- Sign in again
- Check browser console for errors

**Error: "Failed to fetch" on API calls**
- Ensure the dev server is running (`npm run dev`)
- Check that you're accessing `http://localhost:3000`
- Verify no firewall is blocking localhost

### Development Issues

**Changes not reflecting**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear cache and restart dev server
- Check that files are saved

**Slow build times**
- Close unnecessary apps
- Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`

---

## Feature Checklist

### ✅ Fully Functional Features

#### Authentication & User Management
- [x] Sign up with email/password/handle
- [x] Sign in with credentials
- [x] Session management (30-day tokens)
- [x] Logout functionality
- [x] Password validation (8+ characters)
- [x] Handle uniqueness validation
- [x] Email format validation

#### Dashboard
- [x] Real-time stats display (points, level, time saved, badges)
- [x] Level progress bar with next level info
- [x] Recent jobs list (last 5)
- [x] Quick action cards
- [x] Loading states and error handling

#### Profile Page
- [x] Public profile view
- [x] User stats (points, time saved, badges, rank)
- [x] Badges showcase with descriptions
- [x] Portfolio section (public creations)
- [x] Edit profile button
- [x] Avatar with level badge

#### Jobs Management
- [x] List all user jobs
- [x] Job status indicators (done, running, queued, failed)
- [x] Job details (type, duration, credits, time saved)
- [x] Date formatting
- [x] QC report display
- [x] Empty state handling

#### Portfolio Management
- [x] Create creations from jobs
- [x] Edit creation details (title, tags)
- [x] Toggle public/private visibility
- [x] Delete creations
- [x] View/download statistics
- [x] Stats summary (total creations, views, downloads)

#### Referrals System
- [x] Unique referral link generation
- [x] Copy to clipboard functionality
- [x] Referral statistics (total, signed up, paid, credits earned)
- [x] Points earned calculation
- [x] Recent referrals history
- [x] Milestone tracking (3, 10, 25 paid referrals)
- [x] Milestone rewards display

#### Settings
- [x] Update handle
- [x] Update bio (160 char limit)
- [x] Update avatar URL
- [x] Toggle leaderboard visibility
- [x] Read-only email display
- [x] Save confirmation messages
- [x] Error handling

#### Leaderboard
- [x] Three leaderboard types (Time Saved, Referrals, Popularity)
- [x] Top rankings display
- [x] Tab switching
- [x] User rank badges (🥇🥈🥉)
- [x] Real-time data from API
- [x] Loading states

#### Gamification
- [x] Points system (signup, jobs, referrals)
- [x] 7-level progression system
- [x] Badge awards (11 types)
- [x] Level unlocks
- [x] Progress tracking
- [x] Gamification strip on homepage

#### Navigation & UI
- [x] Responsive header with auth state
- [x] Mobile menu
- [x] Dashboard navigation
- [x] Protected routes
- [x] Loading indicators
- [x] Error messages
- [x] Success notifications

### ⚠️ Placeholder/Mock Features (Marked for Future Implementation)

#### AI Features
- [ ] Album Art AI generation (shows placeholder)
- [ ] YouTube to Social AI (shows placeholder)
- [ ] Real AI model integration (OpenAI, Replicate, etc.)

#### Audio Processing
- [ ] MiniStudio file upload to backend
- [ ] Job processing integration
- [ ] Real-time job status updates via WebSocket

#### Backend Infrastructure
- [ ] Database integration (currently in-memory)
- [ ] File storage (S3/CDN)
- [ ] Email service (verification, notifications)
- [ ] Payment processing (Stripe)
- [ ] Real audio processing pipeline

### 🔄 Next Steps for Full Production

1. **Database Migration**
   - Replace in-memory stores with PostgreSQL/MongoDB
   - Implement data persistence
   - Add database migrations

2. **AI Integration**
   - Connect to OpenAI API for text generation
   - Integrate Replicate for image generation
   - Add real YouTube video processing

3. **File Storage**
   - Set up AWS S3 or similar
   - Implement secure file uploads
   - Add CDN for media delivery

4. **Real-time Features**
   - WebSocket for job status updates
   - Live notifications
   - Real-time leaderboard updates

5. **Payment System**
   - Stripe integration
   - Credit purchase flow
   - Subscription management

6. **Email Service**
   - Email verification on signup
   - Password reset flow
   - Notification emails

---

## Architecture Overview

```
Myaiplug/
├── app/                      # Next.js app directory (pages & routes)
│   ├── api/                  # Backend API endpoints
│   │   ├── auth/            # Authentication routes
│   │   ├── user/            # User management
│   │   ├── jobs/            # Job processing
│   │   ├── creations/       # Portfolio items
│   │   ├── referrals/       # Referral system
│   │   └── leaderboard/     # Rankings
│   ├── dashboard/           # Dashboard pages
│   ├── profile/             # Profile page
│   ├── settings/            # Settings page
│   ├── signin/              # Sign in page
│   └── signup/              # Sign up page
├── components/              # Reusable React components
│   ├── dashboard/          # Dashboard-specific components
│   ├── Header.tsx          # Site header with auth
│   ├── AIPlayground.tsx    # AI demos
│   ├── MiniStudio.tsx      # Audio processing demo
│   └── ...
├── lib/                     # Core business logic
│   ├── contexts/           # React contexts (Auth)
│   ├── services/           # Backend services & API client
│   │   ├── api.ts          # Centralized API client
│   │   ├── userService.ts  # User management
│   │   ├── jobService.ts   # Job processing
│   │   ├── pointsEngine.ts # Gamification points
│   │   └── ...
│   ├── constants/          # App constants
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
└── public/                  # Static assets

```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Authenticate user
- `GET /api/auth/session` - Check session validity
- `POST /api/auth/logout` - Invalidate session

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get comprehensive stats

### Jobs
- `GET /api/jobs` - List user's jobs
- `POST /api/jobs` - Create new job

### Creations
- `GET /api/creations` - List creations
- `POST /api/creations` - Add creation
- `PUT /api/creations` - Update creation
- `DELETE /api/creations` - Delete creation

### Referrals
- `GET /api/referrals` - Get referral data

### Leaderboard
- `GET /api/leaderboard` - Get rankings

---

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/myaiplug/Myaiplug/issues)
- **Documentation**: This file + README.md
- **Website**: [myaiplug.com](https://myaiplug.com)

---

## License

All rights reserved © 2025 MyAiPlug™

---

**You're all set!** 🎉

Start building amazing audio experiences with MyAiPlug. If you encounter any issues, check the troubleshooting section or open an issue on GitHub.

**Happy Creating!** 🎵🎨✨
