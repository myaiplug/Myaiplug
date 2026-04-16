# MyAiPlug Full Recovery Plan (Architecture + Revenue)

## 1) Executive Summary

myaiplug.com is partially working, but several core systems are still **demo-grade** (in-memory state, simulated jobs, placeholder AI, mocked downloads). This creates user-visible failures (state resets, inconsistent profile/token history, unreliable processing), blocks trust, and prevents predictable revenue conversion.

This plan gives a **phased, production-focused rollout** with hard acceptance gates per phase so each section is implemented, verified, and monetizable before moving to the next.

---

## 2) Why the site is not working properly today

## 2.1 Deployment / runtime issues

- **Invalid config history** caused deploy failures (already partly fixed): unsupported Next config keys broke builds.
- **Output directory confusion** (`dist` vs `.next`) indicates Vercel project settings drift.
- **Platform config hygiene** is inconsistent (env vars + build assumptions not fully enforced).

## 2.2 Data persistence and reliability gaps

Current backend services still rely on in-memory stores in critical flows:
- user/session profile maps
- jobs
- audio processed-file metadata
- token usage history

Impact:
- data disappears on restart/redeploy
- token/job/profile states become inconsistent
- “worked a minute ago, now gone” behavior
- no durable auditability for billing/revenue

## 2.3 Auth / account system is not production-hardened

- Signup/login currently function, but session and user state are not durable enough for production trust.
- Password/session lifecycle is not backed by a hardened identity provider + persistent store in all critical paths.
- Plan/tier entitlements are mixed between demo and production assumptions.

## 2.4 Feature realities vs user promise

### Stem split
- Route exists and runs processing pipeline, but overall platform still mixes simulated and real flows.
- No guaranteed persistent job artifact lifecycle (upload -> queue -> process -> durable output -> replay/download).

### One-click effects + realtime + download
- Realtime preview in browser exists via Web Audio.
- Backend “process/download” path still includes mock/simulated behavior and non-durable file metadata.
- Download authorization is scaffolded but full ownership enforcement depends on persistent file metadata.

### AI generation
- Several AI endpoints explicitly return placeholders/fallback templates when env/provider unavailable.
- Result quality, latency, and reliability vary due to fallback-first behavior.

### Profile + tokens
- Profile page renders, but token usage/job history durability is limited by in-memory stores in token/job subsystems.
- Revenue-critical metrics (remaining credits, usage history, chargeability) are not yet end-to-end trustworthy.

## 2.5 Monetization blockers

- Credits can be shown/deducted in app logic, but without durable ledger + payment-webhook reconciliation, revenue accuracy risk remains.
- Entitlements are not yet guaranteed by a single source of truth everywhere.
- Users cannot trust purchased capability continuity after deploys/restarts if state is not durable.

---

## 3) Target end-state (what “fully working” means)

The platform is “fixed” only when:

1. **Auth/session/account** is durable and secure.
2. **Credits + entitlements + billing** are ledgered and reconcilable.
3. **Audio workflows** are deterministic:
   - upload -> validate -> process -> persist artifacts -> authorized download
4. **Demo and production modes** are explicit and never mixed silently.
5. **Profile/dashboard** reflects durable truth (jobs, tokens, badges, creations).
6. **SLOs + monitoring** catch failures before users do.

---

## 4) Phased implementation plan (realistic + revenue-first)

## Phase 0 — Stabilize Deploy + Config (1–2 days)

Goal: every deploy is reproducible.

### Tasks
- Lock Vercel project settings:
  - framework: Next.js
  - output directory: **empty/default** (use `.next` automatically)
  - root directory correctness
- Add strict env validation at startup for production:
  - DB URL
  - auth secrets
  - Stripe keys + webhook secret
  - AI provider keys (if AI feature enabled)
- Add CI checks:
  - `npm ci`
  - `npm run build`
  - schema migration check

### Acceptance Gate
- 3 consecutive green deployments
- no config parsing warnings/errors

---

## Phase 1 — Durable Core Data (2–4 days)

Goal: remove in-memory state from revenue/account-critical flows.

### Tasks
- Introduce persistent tables/collections for:
  - users/profiles
  - sessions
  - jobs
  - processed files/artifacts metadata
  - token ledger (append-only)
  - entitlements/subscriptions
- Replace in-memory maps/arrays in services with repository layer.
- Add migration scripts + rollback strategy.

### Acceptance Gate
- restart/redeploy does not lose:
  - users
  - session state
  - jobs
  - token history
  - download permissions

---

## Phase 2 — Auth + Account Hardening (2–3 days)

Goal: signup/login/profile works reliably under real traffic.

### Tasks
- Move to hardened auth provider/session strategy end-to-end.
- Enforce secure password policy + session rotation/expiry.
- Complete profile persistence fields (bio/avatar/level/tier/stats).
- Add rate-limit + abuse controls for auth endpoints.

### Acceptance Gate
- signup/login/logout/session refresh tested in:
  - browser refresh
  - multi-device
  - post-deploy continuity

---

## Phase 3 — Credits, Tokens, Billing, Entitlements (3–5 days)

Goal: money flow is accurate and auditable.

### Tasks
- Implement append-only token ledger:
  - issue
  - consume
  - refund/reversal
- Stripe webhook as source-of-truth updater for subscription + credits.
- Idempotency keys for billing events and usage consumption.
- Align all processing endpoints to a single entitlement check function.

### Acceptance Gate
- For 50 test transactions:
  - expected credits == actual credits
  - webhook replay causes no double-credit/debit

---

## Phase 4 — Audio Productization (Stem Split + One-Click FX) (4–7 days)

Goal: the flagship features feel reliable and conversion-ready.

### 4A — Stem Split strategy
- **Option A (fast monetization path)**: ship “guided demo mode”
  - curated sample track with pre-split stems
  - instant A/B, clear “demo” labeling
- **Option B (full path)**: real user-upload stem split with queue + persistent artifacts

Recommended: launch A in parallel while hardening B.

### 4B — One-click effects
- Keep realtime browser preview for fast UX.
- Persist “rendered file” jobs server-side for downloadable artifacts.
- Ensure format consistency and authorized artifact access.

### Acceptance Gate
- User can:
  1) upload
  2) preview
  3) process
  4) download
  5) revisit later and re-download from profile

---

## Phase 5 — AI Generation Reliability (2–4 days)

Goal: AI features stop silently degrading to placeholders.

### Tasks
- Feature-flag AI capabilities by provider readiness.
- Add explicit UX status:
  - live provider
  - degraded mode
  - unavailable
- Implement retries/timeouts/circuit breakers.
- Log prompt/result metadata for quality tuning (privacy-safe).

### Acceptance Gate
- >95% successful AI job completion for enabled providers
- fallback mode is clearly communicated to users

---

## Phase 6 — Profile, Dashboard, Portfolio, Growth Loops (2–4 days)

Goal: account area reflects real user value and drives retention.

### Tasks
- Profile shows durable:
  - total jobs
  - token usage
  - downloads
  - creations
- Portfolio entries tied to real completed jobs/artifacts.
- Add “recent activity” timeline.
- Implement meaningful rank/leaderboard logic (remove hardcoded rank).

### Acceptance Gate
- profile metrics reconcile with ledger/jobs tables
- no hardcoded fake stats in production mode

---

## Phase 7 — Observability + Launch Readiness (2–3 days)

Goal: catch failures before revenue impact.

### Tasks
- Add structured logs + tracing IDs across all API workflows.
- Add alerts:
  - auth failure spikes
  - webhook failures
  - processing queue latency
  - download authorization failures
- Add smoke tests for every core path.

### Acceptance Gate
- on-call dashboard can isolate and diagnose failures in <15 min

---

## 5) “Fool-proof” execution model (risk-controlled)

No plan can honestly “guarantee” success, but this model gets as close as possible:

1. **Feature flags per phase** (dark launch first).
2. **Acceptance gates** (don’t advance until passed).
3. **Canary deploys** before full rollout.
4. **Rollback scripts** tested every phase.
5. **Data migration rehearsals** in staging clone.
6. **Post-phase retro** with defect burn-down.

---

## 6) Revenue-first rollout order

1. Deploy/config reliability
2. Durable auth + ledger + billing
3. One-click effects + downloadable outputs
4. Stem split (demo-first, real-processing second)
5. Profile/portfolio proof of value
6. AI upsells once core reliability is stable

---

## 7) 30/60/90 day execution timeline

## Day 0–30
- Phases 0–3 complete
- Stable signup/login, credits, Stripe reconciliation
- Production-safe token/job persistence

## Day 31–60
- Phase 4 complete (one-click FX productionized, stem split demo + real path rollout)
- Profile/portfolio tied to real artifacts

## Day 61–90
- Phases 5–7 complete
- AI reliability + observability + growth loops
- Optimize conversion funnels from free demo -> paid processing

---

## 8) KPI dashboard (must track weekly)

- Signup conversion rate
- Login success rate
- Trial -> paid conversion
- Credits purchased vs consumed
- Processing success rate (by feature)
- Median processing latency
- Download success rate
- Refund/dispute rate
- 7-day and 30-day retention

---

## 9) Immediate next 10 tickets (do these now)

1. Add central `env` validator and fail startup on missing prod-required vars.
2. Replace in-memory token store with DB table + repository.
3. Replace in-memory processed file store with DB + object storage mapping.
4. Wire download endpoint to enforce ownership from persistent metadata.
5. Make job creation/processing asynchronous with durable queue state.
6. Implement token ledger table and refactor all consume calls through it.
7. Stripe webhook idempotency + retry-safe reconciliation.
8. Mark all placeholder/demo AI responses with explicit `mode: "demo" | "live"`.
9. Remove hardcoded profile rank and derive from real leaderboard data.
10. Add end-to-end smoke tests:
    - signup/login
    - process audio
    - deduct credits
    - download artifact
    - view profile stats

---

## 10) Bottom line

myaiplug.com can become fully working and income-generating, but only by first fixing **durability + billing truth**. Once auth, ledger, artifact storage, and entitlement checks are production-safe, the rest (stems/effects/AI/profile) becomes reliable and monetizable instead of demo-fragile.

