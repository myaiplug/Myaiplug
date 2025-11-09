# MyAiPlug™ - AI-Powered Audio/Video Platform

**Create faster. Show your score. Get paid in time.**

MyAiPlug is an AI-powered audio/video processing platform with real QC, gamification, and a public creator ecosystem. Transform your content in minutes, earn points and badges, climb leaderboards, and build your reputation.

## 🚀 Features

### Core Processing
- **AI-Powered Pipeline**: Automated audio/video processing with real-time quality checks
- **Multiple Workflows**: Basic Chain, Podcast Polish, Reels Pack, Stem Split, and more
- **Quality Control**: Automatic QC reports with peaks, clipping, and LUFS analysis
- **Multi-Format Export**: Optimized for social media platforms (Instagram, TikTok, YouTube)

### Gamification System
- **Points & Levels**: Earn points for every action, unlock features as you level up
- **7 Levels**: From Rookie to Hall of Fame, with unique unlocks at each tier
- **Badges**: Collect achievements for jobs completed, time saved, referrals, and more
- **Time Saved Tracking**: Every job calculates how much time you've saved vs. manual processing

### Social & Community
- **Public Creator Profiles**: Showcase your work with custom portfolios
- **Leaderboards**: Compete in Time Saved, Referrals, and Popularity rankings
- **Referral System**: Earn rewards for bringing creators to the platform
- **Portfolio Publishing**: Share your best work with view/download tracking

### Credit-Based Pricing
- **Free**: 100 credits to get started
- **Pro**: 1,000 credits/month ($49) - For serious creators
- **Studio**: 3,500 credits/month ($149) - For professional studios

Credits roll over for 30 days. Cancel anytime.

## 🎮 How Gamification Works

### Points System
- Sign-up: **+150 pts**
- Complete onboarding: **+250 pts**
- Job completion: **+100-200 pts** (based on processing time)
- Pro Chain bonus: **+75 pts**
- Referral paid: **+500 pts + 50 credits**
- Weekly streak: **+300 pts**

### Levels & Unlocks
1. **Rookie** (0 pts): Base features
2. **Pro Converter** (2,500 pts): Pro Chains preview, profile banner
3. **Workflow Smith** (7,500 pts): 5% credit bonus, caption style pack #1
4. **Vault Runner** (15,000 pts): Artifact Doctor, detailed QC reports
5. **Creator Coach** (30,000 pts): 1.2× referral multiplier, custom workflows
6. **Studio Pilot** (60,000 pts): Priority queue, API access
7. **Hall of Fame** (120,000 pts): Beta access, creator spotlight

### Badges
- **Upload Hero** I/II/III: Complete 10/100/500 jobs
- **Time Bandit/Lord/Chronomancer**: Save 10/50/200 hours
- **Word of Mouth/Rainmaker/Tycoon**: 3/10/50 paid referrals
- **Clean Cut**: 50 QC-passed deliveries in a row
- **Taste Maker**: 10 published creations with ≥100 views

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion, GSAP
- **Audio**: Web Audio API, Custom DSP modules
- **State**: React Hooks, Context API
- **Deployment**: Vercel (ready)

## 📦 Project Structure

```
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
│   ├── Header.tsx         # Top navigation
│   ├── MultiStepFunnel.tsx # Upload → Process flow
│   ├── ValueTrio.tsx      # Benefits showcase
│   ├── GamificationStrip.tsx # Progress display
│   ├── LeaderboardTeaser.tsx # Rankings preview
│   ├── CreatorProfilePreview.tsx # Profile showcase
│   ├── HowItWorks.tsx     # Process explanation
│   └── FAQ.tsx            # Comprehensive Q&A
├── sections/               # Page sections
│   ├── Hero.tsx           # Landing hero
│   ├── Features.tsx       # Feature highlights
│   ├── Pricing.tsx        # Credit-based plans
│   └── ...
├── lib/
│   ├── types/             # TypeScript definitions
│   ├── constants/         # Gamification rules
│   │   ├── gamification.ts # Points, levels, badges
│   │   ├── pricing.ts     # Credit costs
│   │   └── microcopy.ts   # UI strings
│   └── utils/             # Helper functions
│       ├── helpers.ts     # Formatting, calculations
│       └── mockData.ts    # Development data
└── public/                # Static assets
```

## 🚦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📝 Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- Data models and TypeScript types
- Gamification constants and rules
- Utility functions
- Mock data providers

### ✅ Phase 2: Landing Page (Complete)
- Header with navigation
- Hero with conversion-focused copy
- Multi-step funnel component
- How It Works section
- Value proposition sections
- Gamification displays
- Updated pricing
- Leaderboards preview
- Creator profiles preview
- Comprehensive FAQ

### ✅ Phase 3: User System (Complete)
- Authentication (sign up/sign in/password reset)
- User dashboard with overview, stats, and navigation
- Jobs history page with QC reports
- Portfolio management with edit/delete functionality
- Referrals system with link sharing and milestones
- Public profile pages with badges and creations
- Settings page with privacy controls
- Fully responsive design across all pages

### 📋 Phase 4-8: Backend & Features (Next)
- Points calculation engine
- Badge award system
- Leaderboard ranking
- Referral tracking
- Job processing system
- Payment integration
- Anti-abuse measures
- API development

## 🎯 Anti-Cheat & Fair Play

We maintain platform integrity with:
- Server-side point calculations
- IP/device fingerprinting
- Referral fraud detection
- Bot-filtered view counters
- Audit logging
- Rate limiting

Violations result in penalties ranging from point removal to permanent bans.

## 📄 License

All rights reserved © 2025 MyAiPlug™

## 🤝 Contributing

This is a commercial project. For inquiries, contact the team.

---

**Plug in. Create. Release. Collect.**
