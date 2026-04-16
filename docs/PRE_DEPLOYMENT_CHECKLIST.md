# Industry Pre-Deployment Checklist — MyAiPlug

> **For developers new to production deployments.** This document explains the professional step-by-step order every tool/feature on MyAiPlug should pass through before it goes live. Follow every stage in sequence; never skip a gate.

---

## Why Order Matters

Shipping in the wrong order costs more than doing it right the first time:
- A feature that skips testing may corrupt user data or crash the site.
- A feature that skips security review may expose payment or account data.
- A feature that skips staging may take down production for real users.

The order below is used by every major tech company. It is not optional.

---

## The 7-Stage Professional Deployment Order

```
[1] BUILD  →  [2] TEST  →  [3] REVIEW  →  [4] PREVIEW  →  [5] HARDEN  →  [6] DEPLOY  →  [7] MONITOR
```

---

## Stage 1: Build (Local Development)

**Where:** Your local machine or Codespace  
**Goal:** Feature works end-to-end on your computer

### Steps
1. Implement the feature in a dedicated **branch**, never directly on `main`.
2. Run the app locally and manually click through every user path the feature touches.
3. Check the browser console — there must be **zero errors** in the happy path.
4. Verify the feature works when:
   - User is **not logged in** (guest)
   - User is **logged in** (authenticated)
   - User has **no credits** (edge case)
   - An API call **fails** (error handling)
5. Run the build to catch TypeScript/compile errors:
   ```bash
   npm run build
   ```

### Gate to Stage 2
- [ ] `npm run build` passes with no errors
- [ ] No console errors during manual use
- [ ] All user paths covered by hand-testing

---

## Stage 2: Test (Automated Tests)

**Where:** Local machine / CI pipeline  
**Goal:** Automated checks prove the feature works and doesn't break existing features

### Steps
1. Write (or verify existing) **unit tests** for any service functions you changed.
2. Write (or verify existing) **integration tests** for every API route the feature uses.
3. Run all tests:
   ```bash
   npm test
   ```
4. Check that test coverage for your changed files is **not lower** than before your change.
5. Fix any tests that fail — even if they are "pre-existing". If you changed the code they test, you own them.

### For Each MyAiPlug Feature

| Feature | Tests to verify |
|---------|----------------|
| Auth (signup/login) | User created, session token returned, bad password rejected |
| Audio upload | File accepted, credits deducted, job created, JSON response valid |
| One-click FX | Preset applied, download URL returned, insufficient-credits path rejects |
| Stem split | Input validated, job queued, output artifacts accessible to creator only |
| Stripe/billing | Webhook idempotency, credits issued exactly once, subscription tier reflected |
| Token balance | Balance decreases on spend, never goes negative, history logged |
| Profile page | Reflects latest balance/jobs/badges without needing page refresh |

### Gate to Stage 3
- [ ] `npm test` passes (all green)
- [ ] No regressions in existing tests
- [ ] Edge cases (no credits, bad input, network failure) each have a test

---

## Stage 3: Code Review

**Where:** GitHub pull request  
**Goal:** A second pair of eyes catches mistakes, security gaps, and readability issues

### Steps
1. Open a PR against `main` with a clear description of what changed and why.
2. Self-review your own diff first — read every line as if someone else wrote it.
3. Check:
   - No hardcoded secrets, tokens, or API keys in any file
   - No `console.log` left in production paths (use a logger)
   - Error paths always return valid JSON with a clear `error` field
   - Database queries use parameterized inputs (never string interpolation — this is SQL injection)
   - Uploaded file types are validated server-side (never trust the browser)
4. Address all review comments before moving to Stage 4.

### Security Checklist (must pass before Stage 4)

- [ ] All new API routes check authentication before doing any work
- [ ] Credits are checked **before** processing, not just reported after
- [ ] File downloads verify the requesting user **owns** the file
- [ ] Rate limiting is present on guest/unauthenticated routes
- [ ] No user input is passed directly into shell commands, SQL, or file paths
- [ ] Session tokens travel only in Authorization headers, not form fields or query strings

---

## Stage 4: Preview / Staging Deployment

**Where:** Vercel Preview URL (automatic for each PR) or a dedicated staging environment  
**Goal:** Proves the feature works in a real cloud environment, not just your laptop

### Steps
1. Push your branch — Vercel automatically creates a **preview URL** for every PR.
2. Test the preview URL using the **same steps as Stage 1**, but now on the live URL.
3. Test with **real external services** (Stripe test mode, real S3 bucket in test prefix, real database dev schema).
4. Verify environment variables are set in Vercel's project settings for the preview environment:
   - `DATABASE_URL`
   - `STRIPE_SECRET_KEY` (test key)
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXTAUTH_SECRET` / `JWT_SECRET`
   - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
   - `OPENAI_API_KEY` (if AI feature)
   - `INTERNAL_API_KEY`
5. Check the Vercel **Function Logs** for any server-side errors that didn't appear locally.
6. Complete an end-to-end flow with a real Stripe test card (`4242 4242 4242 4242`).

### Gate to Stage 5
- [ ] Preview deployment builds without warnings
- [ ] All user paths tested on the preview URL
- [ ] Stripe test checkout completes and credits appear in profile
- [ ] Download of a processed file succeeds on preview URL
- [ ] Vercel Function Logs show no unhandled errors

---

## Stage 5: Harden (Pre-Production Checks)

**Where:** Checklist review — no code changes here  
**Goal:** Last line of defense before real users are affected

### Database
- [ ] Any new database tables or columns have a **migration script** that can be run and rolled back
- [ ] Migration has been tested on a copy of the production database
- [ ] Index exists on any column used in `WHERE` clauses for user/job lookup

### Storage
- [ ] S3 buckets have correct **private/public** access settings (processed files = private; portfolio = public)
- [ ] Presigned download URLs have an appropriate expiry (e.g. 1 hour)
- [ ] Large files (>50 MB) are rejected at the API layer before attempting upload

### Monitoring
- [ ] Sentry (or equivalent) is configured and captures unhandled exceptions
- [ ] An alert is set up for 5xx error rate > 1% in a 5-minute window
- [ ] Credit deduction failures log an error to Sentry with full context

### Rollback Plan
- [ ] You know how to **revert the deployment** in < 5 minutes (Vercel: "Redeploy" a previous build)
- [ ] Database migrations are reversible (have a `down` script)
- [ ] If the feature is new, it can be disabled via a **feature flag** environment variable without redeploying

---

## Stage 6: Production Deployment

**Where:** Vercel Production (merge PR to `main`)  
**Goal:** Feature goes live with zero downtime

### Steps
1. Merge the reviewed, green PR into `main`.
2. Vercel automatically deploys to production. Watch the **Vercel deployment dashboard**.
3. If the deployment fails, click "Redeploy" on the last known-good deployment immediately — don't debug on production.
4. If a database migration is needed:
   - Run it **after** the code deployment (new code must tolerate old schema during the window).
   - Never run a migration that drops or renames a column while old code is still serving traffic.
5. After deployment completes, run the Stage 4 manual verification steps again on **myaiplug.com**.

### Feature-by-Feature Production Launch Order

> Always launch in this order. Each stage unlocks the next.

```
[1] Auth (signup / login / session)
     ↓
[2] Profile page + token balance display
     ↓
[3] Stripe billing + webhook → credits issued
     ↓
[4] Audio upload (with credit check + deduction)
     ↓
[5] One-click FX (with download)
     ↓
[6] Stem Split demo (curated demo first, then real upload path)
     ↓
[7] AI features (transcription, analysis, album art)
     ↓
[8] Referral / Leaderboard / Gamification (points, badges)
```

**Why this order?** Each layer depends on the one below it. You cannot reliably sell credits before auth works. You cannot process audio before credits are durable. You cannot show real job history before the database persists jobs.

---

## Stage 7: Monitor (Post-Deployment)

**Where:** Vercel logs + Sentry + your own dashboard  
**Goal:** Catch problems before users report them

### First 30 Minutes After Deploy
- [ ] Watch Vercel Function Logs for new errors
- [ ] Watch Sentry for new issues
- [ ] Make one real purchase with a Stripe test card and verify credits appear
- [ ] Upload one audio file and verify the job completes and the download works

### Ongoing
- [ ] Check error rate daily for the first week
- [ ] Review Sentry alerts within 1 business day
- [ ] Review token ledger for anomalies (unexpected large deductions, users with negative balances)

---

## Quick-Reference: What "Done" Means Per Feature

| Feature | "Done" definition |
|---------|-------------------|
| Auth | Signup → email verification → login → session persists across page refresh → logout clears session |
| Profile | Shows correct tier, token balance, job count, badge list — updates in < 5s after action |
| Tokens | Balance decreases exactly by the stated cost when a job runs; history log is append-only |
| Audio upload | File accepted → credits deducted → job persisted → download URL returned → file accessible via URL |
| One-click FX | Preset applied server-side → processed file stored in S3 → authorized download within 60s |
| Stem split (demo) | Curated stems play in UI with clean A/B switcher; no error states; "upgrade to process yours" CTA |
| Stem split (real) | User file queued → processing completes → stems downloadable → job in history |
| Stripe billing | Checkout succeeds → webhook received → credits appear in profile within 10s |
| Download | Only the user who created a file can download it; expired or unknown IDs return 404/403 |
| AI features | Returns real AI content (not placeholders) when API key is set; graceful fallback when not |

---

## Appendix: Required Environment Variables Before Going Live

```env
# --- Required in ALL environments ---
NEXTAUTH_SECRET=         # 32+ char random string
DATABASE_URL=            # PostgreSQL connection string
INTERNAL_API_KEY=        # Secret key for internal API calls

# --- Required in Staging + Production ---
STRIPE_SECRET_KEY=       # sk_test_... (staging) / sk_live_... (production)
STRIPE_WEBHOOK_SECRET=   # whsec_...
NEXT_PUBLIC_STRIPE_KEY=  # pk_test_... (staging) / pk_live_... (production)

# --- Required for file storage ---
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_UPLOADS=
S3_BUCKET_PROCESSED=

# --- Required for AI features ---
OPENAI_API_KEY=          # sk-...

# --- Optional but recommended ---
SENTRY_DSN=              # Error tracking
REDIS_URL=               # Job queue (required for stem split)
```

> **Security rule**: Never commit any of these values to Git. Set them only in Vercel's Environment Variables dashboard (Settings → Environment Variables).

---

## Summary: The Non-Negotiable Rules

1. **Never deploy directly to `main` without a PR** — even small changes.
2. **Never skip Stage 4** (staging/preview) for any feature that touches money, files, or user data.
3. **Never hardcode a secret** — credentials in code = account compromise.
4. **Always have a rollback plan** before you deploy.
5. **Always monitor for 30 minutes** after each production deployment.
6. **Features go live in the dependency order** shown in Stage 6 — auth before billing before processing.

Follow these rules and every deployment is low-risk and reversible. Skip them and one bad deploy can take the site down or expose user data.
