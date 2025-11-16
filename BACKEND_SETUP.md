# Backend Wiring - Gemini 2.5 Flash Integration

This document describes the backend configuration and API integrations for MyAiPlug.

## Environment Setup

All API keys and configuration are managed through environment variables. Two files are provided:

1. **`.env.example`** - Template with all required and optional variables
2. **`.env`** - Your actual configuration (not committed to git)

### Required Services

#### Google Gemini 2.5 Flash (Primary AI Model)
- **Purpose**: Main AI model for content generation, blog remixing, social media posts
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Environment Variables**:
  - `GOOGLE_GEMINI_API_KEY` - Your Gemini API key
  - `GEMINI_MODEL` - Model version (default: `gemini-2.0-flash-exp`)

#### Supabase (Database & Authentication)
- **Purpose**: User management, data storage, authentication
- **Get Credentials**: https://supabase.com/dashboard
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

#### Stripe (Payment Processing)
- **Purpose**: Subscription billing, payment processing
- **Get Keys**: https://dashboard.stripe.com/apikeys
- **Environment Variables**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key for frontend
  - `STRIPE_SECRET_KEY` - Secret key for backend
  - `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

### Optional Services

#### Replicate (Image Generation)
- **Purpose**: AI-powered image generation for cover art
- **Get API Key**: https://replicate.com/account/api-tokens
- **Environment Variable**: `REPLICATE_API_KEY`

#### Google Imagen 3/4 (Advanced Image Generation)
- **Purpose**: High-quality image generation
- **Environment Variables**:
  - `GOOGLE_IMAGEN_API_KEY` (can reuse Gemini key)
  - `IMAGEN_MODEL` (default: `imagen-3.0-generate-001`)

#### Other Optional Services
- **OpenAI**: Fallback AI model (`OPENAI_API_KEY`)
- **YouTube API**: Enhanced video metadata (`YOUTUBE_API_KEY`)
- **SendGrid**: Email notifications (`SENDGRID_API_KEY`)

## Quick Start

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in `.env`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The app will validate your configuration on startup and show which services are configured.

## AI Service Architecture

### Primary: Gemini 2.5 Flash
All AI content generation uses Google's Gemini 2.5 Flash model:
- Blog post generation and remixing
- Social media content creation
- Audio analysis and description
- YouTube-to-social conversion

### Image Generation
Two options for image generation:
1. **Replicate** (primary): SDXL and other models
2. **Imagen 3/4** (advanced): Google's Imagen model

### Service Files

- **`lib/services/aiService.ts`**: Main AI service wrapper
- **`lib/config/env.ts`**: Environment validation and configuration
- **`app/api/blog/remix/route.ts`**: Blog content remixing
- **`app/api/ai/generate-cover/route.ts`**: Cover art generation
- **`app/api/ai/audio-to-social/route.ts`**: Audio content to social posts
- **`app/api/ai/youtube-to-social/route.ts`**: YouTube to social posts

## Security Notes

- Never commit `.env` to version control (already in `.gitignore`)
- Use separate API keys for development and production
- Rotate keys regularly
- Use environment-specific keys in deployment platforms (Vercel, Netlify, etc.)

## Troubleshooting

### AI Features Not Working
- Check that `GOOGLE_GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid at https://aistudio.google.com
- Check console logs for configuration status

### Payment Features Not Working
- Ensure all three Stripe keys are configured
- Verify webhook secret matches your Stripe dashboard
- Test with Stripe test mode keys first

### Database Features Not Working
- Verify Supabase URL and keys are correct
- Check Supabase dashboard for project status
- Ensure database tables are created (run migrations if needed)

## Next Steps

1. **Add API Keys**: Fill in your `.env` file with real keys
2. **Test Endpoints**: Use the test file `test-api.js` or API routes directly
3. **Configure Webhooks**: Set up Stripe webhooks for payment processing
4. **Set Up Database**: Create Supabase tables and configure Row Level Security
5. **Deploy**: Use Vercel or similar platform, add environment variables there

For more detailed documentation, see:
- `SETUP.md` - Full setup guide
- `API_DOCUMENTATION.md` - API endpoint documentation
- Individual API route files for specific implementations
