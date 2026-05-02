# ╔══════════════════════════════════════════════════════════╗
# ║         SCENESWAP — INDUSTRIAL GRADE MASTER BUILD DOC   ║
# ║         G-Stack Edition | Production Ready | 2 People   ║
# ╚══════════════════════════════════════════════════════════╝

## INSTRUCTIONS FOR CLAUDE CODE
Read this ENTIRE document before writing a SINGLE line of code.
After reading, ask the developer these questions BEFORE starting:

```
MANDATORY QUESTIONS TO ASK BEFORE CODING:

Q1. Environment Setup
    "Have you created accounts on: Supabase, Firebase, Razorpay, 
     Cloudflare R2, Replicate, Modal.com, Resend, Upstash Redis?
     If not, which ones are missing? I'll wait — these are needed 
     before any code can run."

Q2. Domain & Deployment
    "Have you purchased sceneswap.com and sceneswap.io?
     Have you set up your Vercel and Railway.app accounts?
     What is your custom domain for the tracking server?"

Q3. Payments
    "Is your Razorpay account verified? It takes 48 hours.
     Do you have test API keys ready? (rzp_test_...)"

Q4. Two-Person Team Split
    "Who is handling what?
     Person A: Frontend (React/Next.js components, UI)
     Person B: Backend (APIs, database, AI pipeline)
     OR are both working on everything?
     This determines how I structure the git branching."

Q5. Starting Point
    "Which do you want to build first?
     Option A: Landing page + waitlist (validate demand today)
     Option B: Brand portal (campaign creation)
     Option C: Creator portal (video upload + campaign claiming)
     I recommend Option A first — get real users before building features."

Q6. Testing Priority
    "Do you want me to write tests alongside every component I build,
     or write all tests after the MVP is complete?
     Production-grade = tests alongside. Fast MVP = tests after.
     Your choice, I'll follow your decision."

Q7. AI Pipeline
    "For the video rendering — do you want:
     Option A: Use Replicate API (simpler, pay per call, no setup)
     Option B: Self-hosted FFmpeg on Modal.com (more control, cheaper at scale)
     For Week 1, I recommend Option A."
     
DO NOT PROCEED until all 7 questions are answered.
```

---

# ═══════════════════════════════════
# PART 1 — G-STACK EXPLAINED
# ═══════════════════════════════════

## What G-Stack Means For This Project

```
G = GitHub         → Version control, team collaboration, code review
    ├── main branch        (always production-ready)
    ├── develop branch     (integration branch)
    ├── feature/* branches (one branch per feature)
    ├── hotfix/* branches  (emergency production fixes)
    └── release/* branches (staging before prod)

S = Structure      → Monorepo with clear separation of concerns
    ├── apps/web           (Next.js frontend)
    ├── apps/tracking      (Edge tracking server)
    ├── packages/ui        (shared design system)
    ├── packages/types     (shared TypeScript types)
    └── packages/utils     (shared utilities)

T = Testing        → Every feature has tests
    ├── Unit tests         (Vitest — pure functions, utils, hooks)
    ├── Component tests    (React Testing Library — UI components)
    ├── Integration tests  (Vitest + MSW — API routes with mocked deps)
    └── E2E tests          (Playwright — full user journeys)

A = Automation     → Code quality enforced automatically
    ├── ESLint             (catch bugs before runtime)
    ├── Prettier           (consistent code format)
    ├── Husky              (run checks before every commit)
    ├── lint-staged        (only check changed files, fast)
    └── commitlint         (enforce commit message format)

C = CI/CD          → GitHub Actions pipelines
    ├── On every PR:       lint + typecheck + unit tests
    ├── On merge to dev:   integration tests + preview deploy
    ├── On merge to main:  E2E tests + production deploy
    └── On schedule:       dependency security audit (weekly)

K = Kontainers     → Docker for consistency
    ├── docker-compose.yml (local dev: postgres + redis locally)
    ├── Dockerfile.web     (Next.js app container)
    └── Dockerfile.api     (backend API container)
```

---

# ═══════════════════════════════════
# PART 2 — COMPLETE FOLDER STRUCTURE
# (Industrial Grade, Not School Level)
# ═══════════════════════════════════

```
sceneswap/                                    ← ROOT MONOREPO
│
├── .github/                                  ← ALL GITHUB CONFIG
│   ├── workflows/
│   │   ├── ci.yml                            ← Runs on every PR
│   │   ├── deploy-preview.yml                ← Preview on merge to develop
│   │   ├── deploy-production.yml             ← Production on merge to main
│   │   ├── security-audit.yml                ← Weekly dependency scan
│   │   └── e2e-tests.yml                     ← E2E after production deploy
│   ├── PULL_REQUEST_TEMPLATE.md              ← PR checklist template
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── CODEOWNERS                            ← Who reviews which files
│
├── apps/
│   ├── web/                                  ← MAIN NEXT.JS APPLICATION
│   │   ├── src/
│   │   │   ├── app/                          ← Next.js App Router
│   │   │   │   │
│   │   │   │   ├── (marketing)/              ← Public pages, no auth
│   │   │   │   │   ├── page.tsx              ← Creator landing page (/)
│   │   │   │   │   ├── for-brands/
│   │   │   │   │   │   └── page.tsx          ← Brand landing page
│   │   │   │   │   ├── how-it-works/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── pricing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── privacy/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── terms/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx            ← Marketing layout (nav + footer)
│   │   │   │   │
│   │   │   │   ├── (auth)/                   ← Auth flows
│   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── page.test.tsx     ← Unit test
│   │   │   │   │   ├── creator/
│   │   │   │   │   │   └── signup/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── page.test.tsx
│   │   │   │   │   ├── brand/
│   │   │   │   │   │   └── signup/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── page.test.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── (creator)/                ← Creator portal (auth required)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   ├── campaigns/
│   │   │   │   │   │   ├── available/
│   │   │   │   │   │   │   ├── page.tsx      ← KEY: brand ads listed here
│   │   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   │   └── [campaignId]/
│   │   │   │   │   │       └── upload/
│   │   │   │   │   │           ├── page.tsx
│   │   │   │   │   │           └── page.test.tsx
│   │   │   │   │   ├── videos/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [videoId]/
│   │   │   │   │   │       ├── page.tsx      ← Download + tracking link
│   │   │   │   │   │       └── page.test.tsx
│   │   │   │   │   ├── earnings/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx            ← Creator sidebar layout
│   │   │   │   │
│   │   │   │   ├── (brand)/                  ← Brand portal (auth required)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   ├── campaigns/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── new/
│   │   │   │   │   │   │   ├── page.tsx      ← 5-step campaign builder
│   │   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   │   └── [campaignId]/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── analytics/
│   │   │   │   │   │       │   ├── page.tsx
│   │   │   │   │   │       │   └── page.test.tsx
│   │   │   │   │   │       └── creators/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── creators/
│   │   │   │   │   │   └── page.tsx          ← Browse creator marketplace
│   │   │   │   │   ├── brand-kit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── wallet/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── page.test.tsx
│   │   │   │   │   └── layout.tsx            ← Brand sidebar layout
│   │   │   │   │
│   │   │   │   ├── admin/                    ← Internal admin (admin role only)
│   │   │   │   │   ├── page.tsx              ← Overview + revenue
│   │   │   │   │   ├── creators/page.tsx
│   │   │   │   │   ├── brands/page.tsx
│   │   │   │   │   ├── campaigns/page.tsx
│   │   │   │   │   └── payouts/page.tsx
│   │   │   │   │
│   │   │   │   └── api/                      ← Next.js API Routes
│   │   │   │       ├── auth/
│   │   │   │       │   ├── firebase-verify/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts ← API route tests
│   │   │   │       │   └── session/
│   │   │   │       │       ├── route.ts
│   │   │   │       │       └── route.test.ts
│   │   │   │       ├── creator/
│   │   │   │       │   ├── profile/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts
│   │   │   │       │   ├── campaigns/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts
│   │   │   │       │   └── videos/
│   │   │   │       │       ├── route.ts
│   │   │   │       │       └── route.test.ts
│   │   │   │       ├── brand/
│   │   │   │       │   ├── profile/route.ts
│   │   │   │       │   ├── campaigns/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts
│   │   │   │       │   ├── wallet/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts
│   │   │   │       │   └── creators/route.ts
│   │   │   │       ├── upload/
│   │   │   │       │   ├── presigned-url/
│   │   │   │       │   │   ├── route.ts
│   │   │   │       │   │   └── route.test.ts
│   │   │   │       │   └── complete/route.ts
│   │   │   │       ├── ai/
│   │   │   │       │   ├── detect-surfaces/route.ts
│   │   │   │       │   └── render-video/route.ts
│   │   │   │       ├── track/
│   │   │   │       │   └── [code]/
│   │   │   │       │       ├── route.ts      ← Analytics pixel (< 50ms)
│   │   │   │       │       └── route.test.ts
│   │   │   │       └── webhooks/
│   │   │   │           ├── razorpay/
│   │   │   │           │   ├── route.ts
│   │   │   │           │   └── route.test.ts
│   │   │   │           └── modal/
│   │   │   │               ├── route.ts
│   │   │   │               └── route.test.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                       ← Base design system (no business logic)
│   │   │   │   │   ├── Button/
│   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   ├── Button.test.tsx   ← Component tests
│   │   │   │   │   │   └── Button.stories.tsx← Storybook (optional, add later)
│   │   │   │   │   ├── Card/
│   │   │   │   │   │   ├── Card.tsx
│   │   │   │   │   │   └── Card.test.tsx
│   │   │   │   │   ├── Badge/
│   │   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   │   └── Badge.test.tsx
│   │   │   │   │   ├── Input/
│   │   │   │   │   │   ├── Input.tsx
│   │   │   │   │   │   └── Input.test.tsx
│   │   │   │   │   ├── Modal/
│   │   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   │   └── Modal.test.tsx
│   │   │   │   │   ├── Sidebar/
│   │   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   │   └── Sidebar.test.tsx
│   │   │   │   │   ├── MetricCard/
│   │   │   │   │   │   ├── MetricCard.tsx    ← Big number cards (Space Mono)
│   │   │   │   │   │   └── MetricCard.test.tsx
│   │   │   │   │   ├── Spinner/
│   │   │   │   │   ├── EmptyState/
│   │   │   │   │   ├── Tooltip/
│   │   │   │   │   └── index.ts              ← Re-export all UI components
│   │   │   │   │
│   │   │   │   ├── video/                    ← Video-specific components
│   │   │   │   │   ├── VideoPlayer/
│   │   │   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   │   │   └── VideoPlayer.test.tsx
│   │   │   │   │   ├── SurfaceOverlay/       ← Konva.js surface marking
│   │   │   │   │   │   ├── SurfaceOverlay.tsx
│   │   │   │   │   │   └── SurfaceOverlay.test.tsx
│   │   │   │   │   ├── VideoUploadZone/
│   │   │   │   │   │   ├── VideoUploadZone.tsx
│   │   │   │   │   │   └── VideoUploadZone.test.tsx
│   │   │   │   │   └── VideoCard/
│   │   │   │   │       ├── VideoCard.tsx
│   │   │   │   │       └── VideoCard.test.tsx
│   │   │   │   │
│   │   │   │   ├── charts/                   ← Recharts wrappers
│   │   │   │   │   ├── ViewsChart/
│   │   │   │   │   │   ├── ViewsChart.tsx
│   │   │   │   │   │   └── ViewsChart.test.tsx
│   │   │   │   │   ├── EarningsChart/
│   │   │   │   │   ├── RegionMap/            ← react-simple-maps heatmap
│   │   │   │   │   └── CampaignSpendChart/
│   │   │   │   │
│   │   │   │   ├── creator/                  ← Creator-specific components
│   │   │   │   │   ├── CampaignCard/         ← Available campaign display
│   │   │   │   │   │   ├── CampaignCard.tsx
│   │   │   │   │   │   └── CampaignCard.test.tsx
│   │   │   │   │   ├── EarningsBreakdown/
│   │   │   │   │   ├── TrackingLinkBox/      ← The copy-link component
│   │   │   │   │   └── OnboardingTour/
│   │   │   │   │
│   │   │   │   ├── brand/                    ← Brand-specific components
│   │   │   │   │   ├── CampaignBuilder/      ← 5-step wizard
│   │   │   │   │   │   ├── CampaignBuilder.tsx
│   │   │   │   │   │   ├── CampaignBuilder.test.tsx
│   │   │   │   │   │   ├── steps/
│   │   │   │   │   │   │   ├── Step1Details.tsx
│   │   │   │   │   │   │   ├── Step1Details.test.tsx
│   │   │   │   │   │   │   ├── Step2Creative.tsx
│   │   │   │   │   │   │   ├── Step2Creative.test.tsx
│   │   │   │   │   │   │   ├── Step3Targeting.tsx
│   │   │   │   │   │   │   ├── Step3Targeting.test.tsx
│   │   │   │   │   │   │   ├── Step4Creators.tsx
│   │   │   │   │   │   │   ├── Step4Creators.test.tsx
│   │   │   │   │   │   │   ├── Step5Review.tsx
│   │   │   │   │   │   │   └── Step5Review.test.tsx
│   │   │   │   │   │   └── StepProgress.tsx
│   │   │   │   │   ├── CreatorCard/          ← Creator in marketplace
│   │   │   │   │   ├── WalletBalance/
│   │   │   │   │   └── CampaignAnalytics/
│   │   │   │   │
│   │   │   │   └── layout/                   ← Layout shells
│   │   │   │       ├── CreatorLayout.tsx
│   │   │   │       ├── BrandLayout.tsx
│   │   │   │       ├── MarketingLayout.tsx
│   │   │   │       └── AdminLayout.tsx
│   │   │   │
│   │   │   ├── lib/                          ← Pure utility functions (easy to test)
│   │   │   │   ├── clients/                  ← External service clients
│   │   │   │   │   ├── supabase.ts           ← Supabase client (browser)
│   │   │   │   │   ├── supabase-server.ts    ← Supabase client (server/SSR)
│   │   │   │   │   ├── firebase.ts           ← Firebase auth client
│   │   │   │   │   ├── firebase-admin.ts     ← Firebase admin (server only)
│   │   │   │   │   ├── razorpay.ts
│   │   │   │   │   ├── r2.ts                 ← Cloudflare R2 S3-compatible
│   │   │   │   │   ├── replicate.ts
│   │   │   │   │   └── resend.ts
│   │   │   │   │
│   │   │   │   ├── utils/                    ← Pure utility functions
│   │   │   │   │   ├── currency.ts           ← formatINR, formatUSD
│   │   │   │   │   ├── currency.test.ts      ← Unit tests for every util
│   │   │   │   │   ├── numbers.ts            ← formatViews (50K, 1.2M)
│   │   │   │   │   ├── numbers.test.ts
│   │   │   │   │   ├── dates.ts              ← date formatting helpers
│   │   │   │   │   ├── dates.test.ts
│   │   │   │   │   ├── tracking.ts           ← Generate tracking codes
│   │   │   │   │   ├── tracking.test.ts
│   │   │   │   │   ├── earnings.ts           ← Calculate creator earnings
│   │   │   │   │   ├── earnings.test.ts
│   │   │   │   │   └── validation.ts         ← Zod schemas
│   │   │   │   │
│   │   │   │   ├── hooks/                    ← Custom React hooks
│   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   ├── useAuth.test.ts
│   │   │   │   │   ├── useCreatorProfile.ts
│   │   │   │   │   ├── useBrandProfile.ts
│   │   │   │   │   ├── useCampaigns.ts
│   │   │   │   │   ├── useVideoUpload.ts     ← Upload progress + R2
│   │   │   │   │   ├── useVideoUpload.test.ts
│   │   │   │   │   ├── useRazorpay.ts
│   │   │   │   │   └── useRazorpay.test.ts
│   │   │   │   │
│   │   │   │   ├── db/                       ← Database query functions
│   │   │   │   │   ├── creators.ts           ← CRUD for creators
│   │   │   │   │   ├── creators.test.ts      ← Integration tests (mocked Supabase)
│   │   │   │   │   ├── brands.ts
│   │   │   │   │   ├── brands.test.ts
│   │   │   │   │   ├── campaigns.ts
│   │   │   │   │   ├── campaigns.test.ts
│   │   │   │   │   ├── assignments.ts        ← creator_campaign_assignments
│   │   │   │   │   ├── assignments.test.ts
│   │   │   │   │   ├── analytics.ts
│   │   │   │   │   └── payouts.ts
│   │   │   │   │
│   │   │   │   └── ai/                       ← AI pipeline functions
│   │   │   │       ├── detect-surfaces.ts    ← Replicate SAM2 integration
│   │   │   │       ├── detect-surfaces.test.ts
│   │   │   │       ├── render-video.ts       ← Modal.com job trigger
│   │   │   │       ├── render-video.test.ts
│   │   │   │       └── match-creators.ts     ← Algorithm: campaign → creators
│   │   │   │
│   │   │   ├── store/                        ← Zustand global state
│   │   │   │   ├── useAuthStore.ts
│   │   │   │   ├── useAuthStore.test.ts
│   │   │   │   ├── useCreatorStore.ts
│   │   │   │   ├── useBrandStore.ts
│   │   │   │   └── useUIStore.ts             ← Modals, toasts, sidebar open
│   │   │   │
│   │   │   ├── types/                        ← TypeScript type definitions
│   │   │   │   ├── database.ts               ← Supabase-generated types
│   │   │   │   ├── api.ts                    ← API request/response types
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── creator.ts
│   │   │   │   ├── brand.ts
│   │   │   │   └── analytics.ts
│   │   │   │
│   │   │   └── middleware.ts                 ← Route protection middleware
│   │   │
│   │   ├── emails/                           ← React Email templates
│   │   │   ├── layouts/
│   │   │   │   └── BaseEmail.tsx
│   │   │   ├── creator-welcome.tsx
│   │   │   ├── creator-campaign-available.tsx
│   │   │   ├── creator-video-ready.tsx
│   │   │   ├── creator-payout-sent.tsx
│   │   │   ├── brand-welcome.tsx
│   │   │   ├── brand-campaign-live.tsx
│   │   │   ├── brand-analytics-weekly.tsx
│   │   │   └── brand-low-wallet.tsx
│   │   │
│   │   ├── __tests__/
│   │   │   └── e2e/                          ← Playwright E2E tests
│   │   │       ├── auth.spec.ts              ← Login + signup flows
│   │   │       ├── creator-flow.spec.ts      ← Accept campaign → upload → download
│   │   │       ├── brand-flow.spec.ts        ← Create campaign → pay → launch
│   │   │       ├── tracking.spec.ts          ← Tracking link → redirect → log
│   │   │       └── helpers/
│   │   │           ├── auth.ts               ← Test auth helpers
│   │   │           └── fixtures.ts           ← Test data factories
│   │   │
│   │   ├── public/
│   │   │   ├── logo.svg
│   │   │   ├── logo-white.svg
│   │   │   ├── og-image.png                  ← 1200×630 social preview
│   │   │   ├── favicon.ico
│   │   │   ├── apple-touch-icon.png
│   │   │   └── robots.txt
│   │   │
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts                  ← Unit + integration test config
│   │   ├── playwright.config.ts              ← E2E test config
│   │   ├── .eslintrc.json
│   │   └── package.json
│   │
│   └── tracking/                             ← SEPARATE EDGE TRACKING SERVER
│       ├── src/
│       │   ├── index.ts                      ← Cloudflare Worker / Edge function
│       │   ├── handlers/
│       │   │   └── track.ts                  ← The < 50ms redirect + log logic
│       │   ├── lib/
│       │   │   ├── geoip.ts                  ← MaxMind integration
│       │   │   ├── ratelimit.ts              ← Rate limit per IP
│       │   │   └── db.ts                     ← Direct Supabase insert
│       │   └── __tests__/
│       │       └── track.test.ts
│       ├── wrangler.toml                     ← Cloudflare Workers config
│       └── package.json
│
├── packages/
│   ├── ui/                                   ← SHARED UI COMPONENTS (design system)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                                ← SHARED TYPESCRIPT TYPES
│   │   ├── src/
│   │   │   ├── database.ts
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                               ← SHARED CONFIG (ESLint, TS, Tailwind)
│       ├── eslint-next.js
│       ├── tailwind.base.ts
│       └── tsconfig.base.json
│
├── infrastructure/                           ← DOCKER + DEPLOYMENT
│   ├── docker/
│   │   ├── Dockerfile.web                    ← Next.js production container
│   │   └── Dockerfile.tracking              ← Tracking worker container
│   ├── docker-compose.yml                    ← LOCAL DEV: postgres + redis
│   ├── docker-compose.test.yml              ← TEST ENV: isolated test database
│   └── nginx/
│       └── nginx.conf                        ← If self-hosting later
│
├── scripts/
│   ├── setup.sh                              ← One-command dev setup
│   ├── seed-db.ts                            ← Seed test data into local DB
│   ├── generate-types.ts                     ← Pull types from Supabase schema
│   └── check-env.ts                          ← Verify all env vars are set
│
├── docs/
│   ├── architecture.md                       ← System architecture diagram
│   ├── api.md                                ← API documentation
│   ├── deployment.md                         ← How to deploy
│   └── CONTRIBUTING.md                       ← How to contribute (for team)
│
├── .husky/                                   ← Git hooks
│   ├── pre-commit                            ← lint-staged runs here
│   ├── commit-msg                            ← commitlint runs here
│   └── pre-push                             ← Run unit tests before push
│
├── .env.example                              ← Template (committed, no real values)
├── .env.local                                ← Real values (NEVER committed)
├── .env.test                                 ← Test environment values
├── .gitignore
├── .eslintrc.json                            ← Root ESLint config
├── .prettierrc                               ← Prettier config
├── commitlint.config.js                      ← Commit message rules
├── turbo.json                                ← Turborepo config (monorepo builds)
├── package.json                              ← Root workspace package.json
└── README.md
```

---

# ═══════════════════════════════════
# PART 3 — GIT WORKFLOW (Complete)
# ═══════════════════════════════════

## Branch Strategy (GitFlow adapted for 2-person team)

```
main          ← PROTECTED. Always production-ready. Direct push BLOCKED.
              Only merges from: release/* or hotfix/*
              Auto-deploys to: production (Vercel + Railway)

develop       ← Integration branch. All features merge here first.
              Auto-deploys to: preview environment
              Runs: lint + typecheck + unit tests + integration tests

feature/*     ← One branch per feature/task
              Naming: feature/brand-campaign-builder
                      feature/creator-video-upload
                      feature/tracking-pixel
                      feature/razorpay-payouts
              Lives for: duration of that feature (delete after merge)
              Merges into: develop (via Pull Request)

hotfix/*      ← Emergency production bug fixes only
              Naming: hotfix/tracking-link-404
              Branches from: main
              Merges into: main AND develop

release/*     ← Pre-production testing (optional for 2-person team)
              Naming: release/v1.0.0
              Branches from: develop
              Merges into: main
```

## Pull Request Rules

```
REQUIRED for every PR:
□ At least 1 reviewer approval (for 2-person team: the other person)
□ All CI checks pass (lint + typecheck + tests)
□ No merge conflicts
□ PR description filled out (use template)
□ No secrets/API keys in code (checked by git-secrets scanner)
```

## Commit Message Format (Conventional Commits)

```
Format: <type>(<scope>): <description>

Types:
  feat     → New feature
  fix      → Bug fix
  test     → Adding tests
  refactor → Code change (no feature, no fix)
  style    → Formatting only
  docs     → Documentation only
  chore    → Build/config/dependency changes
  perf     → Performance improvement
  ci       → CI/CD changes

Examples:
  feat(brand): add campaign builder step 3 targeting
  fix(tracking): handle missing IP geolocation gracefully
  test(earnings): add unit tests for CPM calculation
  feat(creator): add video surface detection with SAM2
  fix(razorpay): handle webhook signature verification failure
  chore(deps): update next.js to 15.2.1
  docs(api): document tracking endpoint response format

BAD commits (commitlint will reject):
  "fix stuff"
  "wip"
  "asdfgh"
  "minor changes"
```

---

# ═══════════════════════════════════
# PART 4 — COMPLETE GITHUB ACTIONS
# ═══════════════════════════════════

## ci.yml — Runs on every PR

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    name: Lint + TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: sceneswap_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run db:migrate:test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/sceneswap_test
          # All test env vars from .env.test

  build-check:
    name: Build Check
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          # All env vars needed for Next.js build
```

## deploy-production.yml — Runs on merge to main

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  e2e-tests:
    name: E2E Tests (Staging)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          BASE_URL: https://staging.sceneswap.com
          # Staging environment credentials

  deploy-vercel:
    name: Deploy to Vercel (Production)
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  notify-slack:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: deploy-vercel
    if: always()
    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "SceneSwap deployed to production 🚀"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

# ═══════════════════════════════════
# PART 5 — COMPLETE TESTING STRATEGY
# ═══════════════════════════════════

## Testing Pyramid for SceneSwap

```
         /\
        /E2E\          ← 10-15 tests. Full user journeys. Slow.
       /------\           Playwright. Runs before production deploy only.
      /Integr. \       ← 30-50 tests. API routes with mocked external services.
     /----------\         Vitest + MSW. Runs on every PR.
    /Unit tests  \     ← 100+ tests. Pure functions, utils, hooks.
   /--------------\       Vitest. Runs on every commit.
```

## Unit Test Examples (Vitest)

### earnings.test.ts — Test the money math (CRITICAL)
```typescript
// src/lib/utils/earnings.test.ts
import { describe, it, expect } from 'vitest'
import { 
  calculateCreatorEarnings, 
  calculatePlatformFee,
  calculateCPMCost 
} from './earnings'

describe('calculateCreatorEarnings', () => {
  it('should give creator 70% of brand spend', () => {
    expect(calculateCreatorEarnings(10000)).toBe(7000)
    expect(calculateCreatorEarnings(30000)).toBe(21000)
    expect(calculateCreatorEarnings(1500)).toBe(1050)
  })

  it('should handle decimal CPM correctly', () => {
    // 48,200 views × ₹600 CPM = ₹28,920 brand spend
    // Creator gets 70% = ₹20,244
    const brandSpend = (48200 / 1000) * 600
    expect(calculateCreatorEarnings(brandSpend)).toBe(20244)
  })

  it('should never return more than brand paid', () => {
    const brandSpend = 5000
    const creatorEarnings = calculateCreatorEarnings(brandSpend)
    expect(creatorEarnings).toBeLessThan(brandSpend)
  })
})

describe('calculateCPMCost', () => {
  it('should calculate total cost from views and CPM', () => {
    expect(calculateCPMCost(50000, 600)).toBe(30000)  // ₹30,000 for 50K views at ₹600 CPM
    expect(calculateCPMCost(1000, 400)).toBe(400)      // ₹400 for 1K views at ₹400 CPM
  })
})
```

### tracking.test.ts — Tracking code generation
```typescript
// src/lib/utils/tracking.test.ts
import { describe, it, expect } from 'vitest'
import { generateTrackingCode, isValidTrackingCode } from './tracking'

describe('generateTrackingCode', () => {
  it('should generate a unique code every time', () => {
    const code1 = generateTrackingCode()
    const code2 = generateTrackingCode()
    expect(code1).not.toBe(code2)
  })

  it('should generate codes of consistent length', () => {
    const code = generateTrackingCode()
    expect(code.length).toBe(12)
  })

  it('should only contain URL-safe characters', () => {
    const code = generateTrackingCode()
    expect(code).toMatch(/^[a-zA-Z0-9]+$/)
  })
})

describe('isValidTrackingCode', () => {
  it('should reject empty strings', () => {
    expect(isValidTrackingCode('')).toBe(false)
  })

  it('should reject codes with special chars', () => {
    expect(isValidTrackingCode('abc!@#xyz')).toBe(false)
  })

  it('should accept valid codes', () => {
    expect(isValidTrackingCode('abc123DEF456')).toBe(true)
  })
})
```

## Integration Test Examples (Vitest + MSW)

### API route testing with mocked Supabase
```typescript
// src/app/api/creator/campaigns/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { createMockRequest } from '@/test-utils/request'

// Mock Supabase client
vi.mock('@/lib/clients/supabase-server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            data: mockCampaigns,
            error: null
          })
        })
      })
    })
  })
}))

const mockCampaigns = [
  {
    id: 'campaign-1',
    brand: { brand_name: 'Swiggy', logo_url: 'https://...' },
    cpm_rate: 600,
    surface_preference: 'wall',
    status: 'available'
  }
]

describe('GET /api/creator/campaigns', () => {
  it('returns available campaigns for creator', async () => {
    const req = createMockRequest({ 
      method: 'GET',
      userId: 'creator-123'
    })
    
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.campaigns).toHaveLength(1)
    expect(data.campaigns[0].brand.brand_name).toBe('Swiggy')
  })

  it('returns 401 if not authenticated', async () => {
    const req = createMockRequest({ method: 'GET' }) // no userId
    const response = await GET(req)
    expect(response.status).toBe(401)
  })
})
```

## E2E Test Examples (Playwright)

### creator-flow.spec.ts — Full creator journey
```typescript
// __tests__/e2e/creator-flow.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsCreator, seedCreatorWithCampaign } from './helpers/auth'

test.describe('Creator Campaign Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page)
  })

  test('creator can see available brand campaigns', async ({ page }) => {
    await seedCreatorWithCampaign('creator-test@gmail.com')
    await page.goto('/campaigns/available')
    
    await expect(page.getByText('Swiggy Monsoon Campaign')).toBeVisible()
    await expect(page.getByText('₹600 per 1,000 views')).toBeVisible()
  })

  test('creator can accept a campaign and upload video', async ({ page }) => {
    await page.goto('/campaigns/available')
    await page.getByRole('button', { name: 'Accept Campaign' }).click()
    
    // Modal appears
    await expect(page.getByText('Here\'s what happens next')).toBeVisible()
    await page.getByRole('button', { name: 'Upload a Video' }).click()
    
    // Upload page
    await expect(page).toHaveURL(/\/campaigns\/.*\/upload/)
    
    // Upload a test video file
    await page.getByTestId('video-upload-zone').setInputFiles('./fixtures/test-video.mp4')
    await expect(page.getByText('AI scanning your video')).toBeVisible()
    
    // Wait for surface detection (mocked in E2E)
    await expect(page.getByText('Detected Surfaces')).toBeVisible({ timeout: 30000 })
  })
  
  test('tracking link redirects and logs correctly', async ({ page }) => {
    // This tests the core money-making mechanic
    const trackingCode = 'test123abc456'
    const response = await page.request.get(`/api/track/${trackingCode}`)
    
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toContain('swiggy.com')
  })
})
```

---

# ═══════════════════════════════════
# PART 6 — CONFIG FILES (Copy-Paste Ready)
# ═══════════════════════════════════

## package.json (root)
```json
{
  "name": "sceneswap",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:unit": "vitest run --reporter=verbose",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:migrate": "supabase db push",
    "db:migrate:test": "supabase db push --db-url $DATABASE_URL",
    "db:seed": "tsx scripts/seed-db.ts",
    "db:types": "supabase gen types typescript --linked > apps/web/src/types/database.ts",
    "prepare": "husky install",
    "setup": "bash scripts/setup.sh"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.2.0",
    "turbo": "^2.0.0"
  }
}
```

## vitest.config.ts
```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'src/types/',
        '**/*.stories.tsx',
        '**/*.config.ts'
      ],
      thresholds: {
        // Fail CI if coverage drops below these
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    // Exclude E2E tests from unit test run
    exclude: ['__tests__/e2e/**', 'node_modules/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

## playwright.config.ts
```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['github']],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop Chrome (primary)
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile (important for creator side — they use phone)
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    // Brand side tested on desktop only
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:testing-library/react",
    "plugin:vitest/recommended"
  ],
  "plugins": ["@typescript-eslint", "testing-library", "vitest"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "testing-library/no-debugging-utils": "warn"
  }
}
```

## .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "importOrder": [
    "^(react|next)(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "plugins": ["@trivago/prettier-plugin-sort-imports"]
}
```

## commitlint.config.js
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'test', 'refactor', 
      'style', 'docs', 'chore', 'perf', 'ci'
    ]],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200]
  }
}
```

## .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged (only check changed files)
npx lint-staged

# Check for secrets (API keys accidentally committed)
npx secretlint "**/*"
```

## .husky/commit-msg
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Enforce conventional commits
npx --no -- commitlint --edit ${1}
```

## .husky/pre-push
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run unit tests before push (fast, ~30 seconds)
npm run test:unit
```

## lint-staged config (in package.json)
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,css}": [
    "prettier --write"
  ]
}
```

## docker-compose.yml (Local Dev)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sceneswap_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Optional: local Supabase (alternative to cloud Supabase)
  # supabase:
  #   image: supabase/postgres:15
  #   (use 'supabase start' CLI command instead)

volumes:
  postgres_data:
  redis_data:
```

## turbo.json (Monorepo build pipeline)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:unit": {
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## scripts/setup.sh (One command to set up everything)
```bash
#!/bin/bash
set -e

echo "🎬 Setting up SceneSwap development environment..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up git hooks
echo "🪝 Setting up git hooks..."
npx husky install

# Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found. Copying from .env.example..."
  cp .env.example .env.local
  echo "📝 Please fill in your credentials in .env.local"
fi

# Start local services
echo "🐳 Starting local database and Redis..."
docker-compose up -d

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres; do
  sleep 1
done

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed test data
echo "🌱 Seeding development data..."
npm run db:seed

echo ""
echo "✅ Setup complete! Run 'npm run dev' to start."
echo ""
echo "URLs:"
echo "  App:      http://localhost:3000"
echo "  DB:       postgresql://postgres:postgres@localhost:5432/sceneswap_dev"
echo "  Redis:    redis://localhost:6379"
```

---

# ═══════════════════════════════════
# PART 7 — GITHUB REPOSITORY SETUP
# ═══════════════════════════════════

## Step 1: Create Repository

```bash
# In terminal
git init sceneswap
cd sceneswap
git remote add origin https://github.com/[your-username]/sceneswap.git

# Create initial structure
mkdir -p apps/web apps/tracking packages/ui packages/types packages/config
mkdir -p .github/workflows .github/ISSUE_TEMPLATE
mkdir -p infrastructure/docker scripts docs
```

## Step 2: Branch Protection Rules (Set on GitHub.com)

```
Go to: GitHub → Settings → Branches → Add rule

Rule for 'main':
  ✅ Require pull request reviews before merging
     → Required approving reviews: 1
  ✅ Require status checks to pass before merging
     → Required checks: lint-and-typecheck, unit-tests, build-check
  ✅ Require branches to be up to date before merging
  ✅ Do not allow bypassing (even admins can't push directly)

Rule for 'develop':
  ✅ Require pull request reviews before merging
     → Required approving reviews: 1
  ✅ Require status checks to pass before merging
     → Required checks: lint-and-typecheck, unit-tests
```

## Step 3: GitHub Secrets (Set on GitHub.com)

```
Go to: GitHub → Settings → Secrets and variables → Actions → New secret

Add all from your .env.local:
  VERCEL_TOKEN
  VERCEL_ORG_ID
  VERCEL_PROJECT_ID
  RAILWAY_TOKEN
  SUPABASE_ACCESS_TOKEN
  SUPABASE_PROJECT_ID
  SLACK_WEBHOOK (optional, for deploy notifications)
  CODECOV_TOKEN (for coverage reports)
```

## Step 4: CODEOWNERS file

```
# .github/CODEOWNERS
# These users must review PRs touching these paths

# AI pipeline changes need careful review
apps/web/src/lib/ai/          @[your-github-username]

# Payment code needs review from both team members
apps/web/src/app/api/webhooks/razorpay/    @person1 @person2
apps/web/src/lib/utils/earnings.ts         @person1 @person2

# Database schema changes need review
apps/web/src/lib/db/           @[your-github-username]
```

## Step 5: PR Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->
## What does this PR do?
<!-- Brief description of changes -->

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Tests
- [ ] Documentation

## Checklist
- [ ] I've tested this manually in the browser
- [ ] I've added/updated unit tests for new code
- [ ] All existing tests pass (`npm run test:unit`)
- [ ] TypeScript has no errors (`npm run typecheck`)
- [ ] No new ESLint warnings
- [ ] No secrets or API keys added to code
- [ ] UI changes tested on mobile screen size

## Screenshots (if UI changes)
<!-- Add before/after screenshots -->

## Related issues
<!-- Closes #123 -->
```

---

# ═══════════════════════════════════
# PART 8 — CLAUDE CODE FULL PROMPTS
# ═══════════════════════════════════

## IMPORTANT: How to use these prompts
1. Open Claude Code (terminal or web)
2. Start a new session
3. FIRST: paste the mandatory questions from the top of this document
4. AFTER questions answered: paste prompts in order below

---

### PROMPT 0 — READ AND ASK FIRST (Always start here)
```
Read the entire attached PRD document. 
Before writing any code, ask me the 7 mandatory questions listed at 
the top of the document under "MANDATORY QUESTIONS TO ASK BEFORE CODING."
Wait for my answers before proceeding.
```

---

### PROMPT 1 — MONOREPO FOUNDATION
```
Based on the PRD I've shared, initialize a Turborepo monorepo with this structure:
- apps/web (Next.js 15 with TypeScript and App Router)
- apps/tracking (Cloudflare Workers script)
- packages/types (shared TypeScript types)
- packages/config (shared ESLint, Prettier, TS configs)

Set up ALL tooling from Part 6 of the PRD:
1. Install and configure Vitest for unit testing
2. Install and configure Playwright for E2E testing  
3. Set up ESLint + Prettier with configs from Part 6
4. Set up Husky + lint-staged + commitlint with configs from Part 6
5. Create turbo.json with the pipeline from Part 6
6. Create docker-compose.yml from Part 6
7. Create scripts/setup.sh from Part 6
8. Create .env.example with all variables from the PRD (no real values)
9. Create .github folder with CI workflow from Part 4
10. Create .gitignore (ignore: .env.local, node_modules, .next, coverage, dist)

After creating all files, run: npm run typecheck && npm run lint
They should both pass with zero errors before we continue.
```

---

### PROMPT 2 — DATABASE SETUP
```
In the apps/web project, set up the complete database layer:

1. Create src/lib/clients/supabase.ts (browser client)
   and src/lib/clients/supabase-server.ts (server-side client)

2. Create ALL database tables in src/lib/db/schema.sql 
   using the exact schema from Part 3 of the PRD.
   Include:
   - users table
   - brand_profiles table
   - brand_kit_assets table  
   - creator_profiles table
   - campaigns table
   - creator_campaign_assignments table
   - video_analytics_events table
   - wallet_transactions table
   - creator_payouts table
   - notifications table
   Add proper indexes on: user_id, brand_id, creator_id, campaign_id, 
   tracking_code, status, created_at

3. Create typed query functions in:
   - src/lib/db/creators.ts
   - src/lib/db/brands.ts
   - src/lib/db/campaigns.ts
   - src/lib/db/assignments.ts
   - src/lib/db/analytics.ts
   - src/lib/db/payouts.ts
   
   Each file should export: getById, getAll (with filters), create, update, delete
   All functions must be fully TypeScript typed using types from src/types/database.ts

4. Write unit tests for the critical earnings functions in:
   src/lib/utils/earnings.ts and earnings.test.ts
   Use the exact test examples from Part 5 of the PRD.

5. Write unit tests for tracking code in:
   src/lib/utils/tracking.ts and tracking.test.ts

Run npm run test:unit — all tests must pass before continuing.
```

---

### PROMPT 3 — DESIGN SYSTEM + GLOBAL STYLES
```
Set up the complete design system for SceneSwap in apps/web:

1. In src/app/globals.css:
   - Add ALL CSS variables from Part 3 Design System section of the PRD
   - Add the complete typography scale with .text-hero, .text-h1, etc.
   - Add the full type scale using Syne + DM Sans + Space Mono
   - Add CSS component classes: .btn-primary, .card, .card-highlight, .badge-*

2. In tailwind.config.ts:
   - Extend theme with all CSS variables as Tailwind colors
   - Add custom font families
   - Add custom shadow utilities (shadow-lime, shadow-violet)
   - Add custom animation utilities

3. Build these UI components in src/components/ui/:
   Each MUST have a .test.tsx file with at minimum 3 tests:
   
   - Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
   - Card (variants: default, highlighted)
   - Badge (variants: active, pending, error, info from the design system)
   - Input (with label, error state, helper text)
   - MetricCard (icon, label, value in Space Mono, optional trend indicator)
   - Modal (with overlay, close button, title, body, footer)
   - Spinner (sizes: sm, md, lg)
   - EmptyState (icon, title, description, optional CTA button)

4. The visual requirements (NON-NEGOTIABLE):
   - Background color: #080808 (near black)
   - Primary accent: #C8FF00 (Electric Lime) - ONLY on CTAs and numbers
   - All metric numbers in Space Mono font
   - Cards have 1px border: #2E2E2E with 12px border radius
   - Hover state: Electric Lime glow (0 0 20px rgba(200,255,0,0.3))
   - NO pure white (#FFFFFF) anywhere — use #F2F0EA warm white for text
   
Run: npm run test:unit (all component tests must pass)
Run: npm run typecheck (zero TypeScript errors)
```

---

### PROMPT 4 — LANDING PAGES (Validate Demand First)
```
Build the two public landing pages in apps/web.
These must be production-quality enough to collect real email signups TODAY.

1. Creator Landing Page: src/app/(marketing)/page.tsx
   
   Section 1 — Hero:
   Full viewport height. Background: #080808 with subtle noise texture.
   "Your Background" in Syne 800 weight, #F2F0EA, 72px
   "Pays You." on next line, same size but in #C8FF00 (Electric Lime)
   Subheading: "Upload your video. AI finds the ad surfaces. Brands pay you per view."
   in DM Sans 400, #8A8A8A, 20px, max-width 560px
   Primary CTA button: "Start Earning Free →" (Electric Lime background, dark text)
   Secondary: "See how it works ↓" (ghost button)
   
   Section 2 — How It Works (3 steps, animated on scroll):
   Step 1: "Upload any video" — icon of video file
   Step 2: "AI finds your ad surfaces" — icon of scanning/detection  
   Step 3: "Brands pay, you earn 70%" — icon of money/wallet
   Each step appears with staggered Framer Motion animation on scroll
   
   Section 3 — Social Proof:
   "Join 1,200+ creators already earning"  (placeholder numbers for launch)
   3 creator cards with fake testimonials, earnings amounts in #C8FF00
   
   Section 4 — Email Waitlist (CRITICAL — this is the actual product today):
   "Be first to know when we launch"
   Email input + "Join Waitlist" button
   On submit: POST to /api/waitlist, store email in Supabase waitlist table
   Show: "You're on the list! We'll notify you at launch."

2. Brand Landing Page: src/app/(marketing)/for-brands/page.tsx
   
   Section 1 — Hero:
   "Place Your Brand in 10,000 Videos. Pay Only for Real Views."
   CPM comparison table (visual): SceneSwap ₹400-800 vs Meta ₹800-2000 vs TV ₹5000+
   CTA: "Launch Your First Campaign"
   
   Section 2 — How It Works for Brands (3 steps)
   Section 3 — Brand categories we work with (F&B, Fashion, Tech, Beauty)
   Section 4 — "Book a Demo" form (name + email + phone + company)

3. Shared marketing layout (nav + footer):
   Nav: SceneSwap logo | How It Works | For Brands | Pricing | Login | Sign Up
   Footer: minimal, just links and © 2026 SceneSwap
   
4. Add Framer Motion for:
   - Staggered text reveal on hero (each word appears 50ms apart)
   - Section scroll animations (fade up on enter)
   - Button hover states (subtle scale + glow)

Write a smoke test: src/app/(marketing)/page.test.tsx
Test: page renders, email form submits correctly, shows confirmation message.
```

---

### PROMPT 5 — AUTH SYSTEM
```
Build the complete authentication system:

1. Firebase Auth setup in src/lib/clients/firebase.ts:
   - Google OAuth provider
   - Email/password provider
   - onAuthStateChanged listener
   
2. Firebase Admin setup in src/lib/clients/firebase-admin.ts:
   - Server-side token verification
   - Used in API routes to verify user identity
   
3. Zustand auth store in src/store/useAuthStore.ts:
   - State: user (FirebaseUser | null), role ('creator'|'brand'|'admin'|null), 
     profile (creator or brand profile), loading, error
   - Actions: setUser, clearUser, setRole, setProfile

4. Auth middleware in src/middleware.ts:
   - Routes starting with /dashboard → require creator role → redirect to /login if not
   - Routes starting with /brand → require brand role → redirect to /login if not
   - Routes starting with /admin → require admin role → redirect to / if not
   - Public routes pass through

5. Auth pages:
   - src/app/(auth)/login/page.tsx:
     Tab switcher: Creator Login | Brand Login
     Google OAuth button + Email/password form
     On success: redirect based on role (creator → /dashboard, brand → /brand/dashboard)
     On new user: redirect to respective signup/onboarding
   
   - src/app/(auth)/creator/signup/page.tsx:
     Fields from Creator Registration (Flow B1 in the full PRD)
     On submit: create Firebase user + Supabase creator_profiles record
     Redirect to /dashboard
   
   - src/app/(auth)/brand/signup/page.tsx:
     Fields from Brand Registration (Flow A1 in the full PRD)
     On submit: create Firebase user + Supabase brand_profiles record
     Redirect to /brand/dashboard

6. API route: src/app/api/auth/firebase-verify/route.ts:
   POST endpoint: receives Firebase ID token
   Verifies with Firebase Admin SDK
   Returns: { userId, email, role }
   
7. Write tests:
   - useAuthStore.test.ts (test state transitions)
   - firebase-verify/route.test.ts (test with valid + invalid tokens)
```

---

### PROMPT 6 — BRAND PORTAL
```
Build the complete Brand Portal (all pages from Flow A in the PRD):

1. Brand Layout: src/app/(brand)/layout.tsx
   Left sidebar with all navigation items + user avatar + wallet balance at bottom
   
2. Brand Dashboard: src/app/(brand)/dashboard/page.tsx
   - 4 metric cards row (Total Views, Active Campaigns, Wallet Balance, Total Spent)
   - Line chart of daily views (Recharts LineChart, last 30 days)
   - Active campaigns list with status badges
   
3. Campaign Builder: src/app/(brand)/campaigns/new/page.tsx
   THIS IS THE MOST IMPORTANT BRAND FEATURE. Build it completely.
   5-step wizard with progress bar at top.
   All 5 steps from Flow A4 in the main PRD document.
   Form state managed with React Hook Form + Zod.
   On Step 5 submit: POST to /api/brand/campaigns
   
   API route: src/app/api/brand/campaigns/route.ts
   On POST:
   a. Validate all campaign data with Zod
   b. Insert into campaigns table
   c. Run creator matching algorithm (from src/lib/ai/match-creators.ts):
      SELECT creator_profiles WHERE 
        niche IN campaign.target_niches AND
        follower_count >= campaign.min_followers AND
        country = campaign.target_regions (any overlap)
   d. Insert creator_campaign_assignments for each matched creator (status='available')
   e. Send email to each matched creator via Resend
   f. Return: { campaignId, matchedCreators: count, estimatedReach }
   
4. Brand Wallet: src/app/(brand)/wallet/page.tsx
   Wallet balance + Add Funds button
   Add Funds flow: POST /api/brand/wallet/add-funds
   Creates Razorpay order → opens Razorpay checkout modal
   On payment success: Razorpay webhook → POST /api/webhooks/razorpay
   Webhook handler: verify signature, update wallet_balance in brand_profiles
   
5. Brand Kit: src/app/(brand)/brand-kit/page.tsx
   Upload logo, product images, video clips (react-dropzone → R2)
   Show grid of uploaded assets
   
Write tests for:
- CampaignBuilder step validation (each step's Zod schema)
- /api/brand/campaigns route (POST with valid data, POST with missing fields)
- Razorpay webhook signature verification
```

---

### PROMPT 7 — CREATOR PORTAL (The Money-Making Side)
```
Build the complete Creator Portal (all pages from Flow B in the PRD):

1. Creator Layout: src/app/(creator)/layout.tsx
   Sidebar with alert badge showing count of available campaigns
   
2. Creator Dashboard: src/app/(creator)/dashboard/page.tsx
   Alert banner if campaigns available (Electric Lime highlight, pulsing)
   "X brand campaigns are waiting for you. Earn up to ₹X,XXX"
   Stats row: Videos Active, Total Earned, Pending Payout, Total Views
   Earnings chart (Recharts LineChart, last 30 days)
   
3. Available Campaigns Page: src/app/(creator)/campaigns/available/page.tsx
   THIS IS THE KEY PAGE. Brands' campaigns appear here.
   
   API: GET /api/creator/campaigns/available
   Returns: creator_campaign_assignments where 
     creator_id = current user AND status = 'available'
   With: joined brand_profiles data (logo, name, category)
   And: joined campaigns data (cpm_rate, surface_preference, target_regions, dates)
   
   Render: CampaignCard grid (component from src/components/creator/CampaignCard/)
   Each card: brand logo, brand name, CPM rate in Electric Lime, surface type,
   target regions, campaign dates, "Accept Campaign →" button
   
   On "Accept Campaign":
   Modal: explains the 5-step process (from Flow B3 of main PRD)
   "Upload a Video for This Campaign →" → navigates to upload page

4. Video Upload Page: src/app/(creator)/campaigns/[campaignId]/upload/page.tsx
   Steps from Flow B4 of the main PRD.
   Step 1: react-dropzone video upload → presigned URL → R2
   Step 2: After upload, call /api/ai/detect-surfaces
   Step 3: Display Konva.js surface overlays on video
   Step 4: Confirm → /api/ai/render-video
   Step 5: "Processing" screen with email notification promise

5. Video Ready Page: src/app/(creator)/videos/[videoId]/page.tsx
   Everything from Flow B5 of the main PRD.
   Download buttons (3 quality options via signed R2 URLs)
   TRACKING LINK COMPONENT (TrackingLinkBox) — this is critical:
   Large, obvious display of tracking URL
   "Copy Link" button (copy to clipboard)
   "Share to Instagram" button (opens Instagram share intent)
   "Share to WhatsApp" button (opens WhatsApp with link in message)
   AI-generated caption suggestions (3 options via Claude API)
   Clear instructions: "Put this link in your bio or caption"

6. Creator Earnings: src/app/(creator)/earnings/page.tsx
   Full breakdown from Flow B6 of main PRD
   Table: Video | Brand | Views Verified | Rate | Earned | Status | 
   Payout history
   Bank/UPI details form

7. Tracking endpoint: src/app/api/track/[code]/route.ts
   Edge function — must respond in < 100ms
   Complete logic from Analytics Engine section of main PRD:
   - Lookup tracking code
   - Log event to video_analytics_events
   - Increment views_verified
   - Update creator earnings
   - 301 redirect to campaign destination

Write tests for:
- /api/creator/campaigns/available (returns correct campaigns for creator)
- /api/track/[code] (logs event, returns 301, handles invalid code with 404)
- TrackingLinkBox component (renders link, copy button works)
```

---

### PROMPT 8 — AI PIPELINE
```
Build the AI processing pipeline:

1. Surface Detection: src/lib/ai/detect-surfaces.ts
   Calls Replicate API with SAM2 model
   Input: video URL (from R2)
   Output: array of SurfaceZone objects with type, coordinates, frame_range, scores
   
   API route: src/app/api/ai/detect-surfaces/route.ts
   POST: { videoUrl, assignmentId }
   - Validate video URL is from our R2 bucket (security check)
   - Create Replicate prediction
   - Store prediction ID in Redis with assignment ID as key
   - Return: { jobId, estimatedSeconds: 60 }
   
   GET (polling): src/app/api/ai/detect-surfaces/[jobId]/route.ts
   - Check Replicate prediction status
   - If complete: parse output, store zones in Supabase, return zones
   - If processing: return { status: 'processing', progress: X }
   - If failed: return { status: 'failed', error: message }

2. Video Rendering: src/lib/ai/render-video.ts
   Builds the render job payload for Modal.com
   Handles: image placement, video clip placement, logo placement
   Each creative type has different compositing logic

   API route: src/app/api/ai/render-video/route.ts
   POST: { assignmentId, selectedZoneId, brandAssetUrl }
   - Fetch assignment + campaign + creator video from DB
   - Build render job: video URL, asset URL, zone coordinates, frame range
   - POST to Modal.com endpoint
   - Update assignment status to 'rendering'
   - Return: { jobId }

   Webhook: src/app/api/webhooks/modal/route.ts
   Called by Modal when render completes
   - Verify Modal webhook signature
   - Get rendered video URL
   - Update assignment: rendered_video_url, status='ready'
   - Generate unique tracking code (src/lib/utils/tracking.ts)
   - Save tracking code to assignment
   - Send email to creator: "Your video is ready!" with download link
   - Send in-app notification via Supabase Realtime

3. Creator Matching Algorithm: src/lib/ai/match-creators.ts
   Input: campaign targeting criteria (niches, regions, min_followers, surface_preference)
   Output: array of matching creator IDs + their estimated CPM rates
   
   Algorithm:
   1. Query creator_profiles with filters
   2. Score each creator: follower_quality × niche_match × region_match
   3. Sort by score descending
   4. Return top 50 creators (or all if < 50 match)

Write tests for:
- match-creators.ts: test filtering, scoring, edge cases (no matches, all match)
- detect-surfaces/route.ts: mock Replicate API, test success and failure paths
- modal webhook: test signature verification, test status update
```

---

### PROMPT 9 — PAYOUT SYSTEM + NOTIFICATIONS
```
Build the money transfer system and real-time notifications:

1. Weekly Payout Cron: src/lib/cron/weekly-payouts.ts
   (Triggered via Vercel Cron or external cron service)
   
   Logic:
   a. SELECT creator_profiles WHERE pending_payout > 100
   b. For each creator with pending amount:
      - Create Razorpay Payout (to UPI ID or bank account)
      - INSERT into creator_payouts with status='processing'
   c. Razorpay webhook updates status to 'completed' or 'failed'
   d. On 'completed': zero out pending_payout, add to total_earned
   e. Send payout confirmation email
   
   API route: src/app/api/cron/weekly-payouts/route.ts
   Protected by secret header (only Vercel Cron can call this)

2. Supabase Realtime notifications:
   In-app notifications use Supabase Realtime channels
   
   In layout.tsx (both creator and brand):
   Subscribe to notifications table WHERE user_id = current user
   On INSERT: show toast notification + increment badge count
   
   Notification Bell component: src/components/ui/NotificationBell/
   - Bell icon with red badge (count of unread)
   - Click: dropdown with last 10 notifications
   - Click notification: mark as read + navigate to relevant page
   - "Mark all read" button

3. Analytics aggregation cron: src/lib/cron/aggregate-analytics.ts
   Runs every 6 hours
   - For assignments with status='posted' and post_url set:
     Pull view counts from Instagram API or YouTube API
   - Update video_analytics_events with type='api_update'
   - Recalculate earnings: views × cpm_rate × 0.70
   - Update pending_payout on creator_profiles

4. Email system: all templates in /emails/ directory
   Using React Email + Resend SDK
   Build all 8 templates listed in the main PRD folder structure
   Each template: mobile-responsive, dark theme, SceneSwap branding
   
Write tests for:
- Payout calculation logic (test with various amounts including edge cases)
- Notification creation and marking as read
- Cron route endpoint (test authentication, test correct creator selection)
```

---

### PROMPT 10 — ADMIN PANEL + POLISH
```
Final build prompt — Admin panel and production polish:

1. Admin Panel: src/app/admin/
   Protected by admin role check in middleware
   
   Overview page: 
   - Revenue today / this week / this month (Space Mono numbers)
   - Total creators / brands / active campaigns
   - Recent campaigns list with approve/reject buttons
   - System health indicators
   
   Campaigns queue: 
   - All campaigns with status='draft' waiting for approval
   - Each shows: brand name, creative preview, targeting, budget
   - Approve → status becomes 'active', creator matching runs
   - Reject → brand gets email with rejection reason
   
   Payouts page:
   - All creators with pending_payout > 0
   - "Process All Payouts" button → triggers weekly-payouts cron
   - Payout history with status tracking

2. Production Polish:
   - Add loading skeletons for all data-fetching pages
   - Add error boundaries (show friendly error UI, not crash)
   - Add empty states for all list views (0 campaigns, 0 videos, 0 earnings)
   - Ensure all pages are responsive (test at 375px iPhone SE width)
   - Add meta tags for SEO (title, description, og:image for each page)
   - Add 404 page (src/app/not-found.tsx)
   - Add global error page (src/app/error.tsx)

3. Performance:
   - Implement React Query for all API calls (caching + refetch)
   - Add Next.js Image optimization for all images
   - Add loading.tsx skeleton screens for all portal pages
   - Lazy load video player component (it's heavy)

4. E2E Tests — write the 4 critical test files from Part 5:
   - __tests__/e2e/auth.spec.ts
   - __tests__/e2e/creator-flow.spec.ts
   - __tests__/e2e/brand-flow.spec.ts
   - __tests__/e2e/tracking.spec.ts

5. Final checks:
   Run: npm run lint → must be 0 warnings
   Run: npm run typecheck → must be 0 errors
   Run: npm run test:unit → must be 100% pass
   Run: npm run build → must complete without errors
   
   If any of the above fail, fix them before marking this complete.
```

---

# ═══════════════════════════════════
# PART 9 — WEEK 1 EXECUTION ORDER
# ═══════════════════════════════════

## Day-by-Day for 2 People

```
BEFORE DAY 1 (do today, 2 hours):
  Both people:
  □ Create all accounts listed in Part 7, Section "Day 0 Setup Checklist"
  □ Razorpay merchant application submitted (48h verification — CRITICAL)
  □ Domain purchased: sceneswap.com + sceneswap.io
  □ GitHub repo created, both people added as collaborators
  
DAY 1:
  Person A (Frontend): Run Prompt 1 (monorepo setup) + Prompt 4 (landing pages)
  Person B (Backend):  Run Prompt 1 (same) + Prompt 2 (database setup)
  End of day: Landing page live on Vercel, share URL publicly
              Database schema live in Supabase
  
DAY 2:
  Person A: Prompt 3 (design system + UI components)
  Person B: Prompt 5 (auth system)
  End of day: Can sign up and log in as creator or brand
  
DAY 3:
  Person A: Start Prompt 6 (brand portal — campaign builder UI)
  Person B: Prompt 7 APIs (available campaigns + video upload APIs)
  End of day: Brand can create a campaign (even if no AI yet)
  
DAY 4:
  Person A: Finish Prompt 6 (brand dashboard + wallet UI)
  Person B: Prompt 8 (AI pipeline — surface detection + rendering)
  End of day: Full campaign creation flow working end-to-end
  
DAY 5:
  Person A: Prompt 7 (creator portal — all pages)
  Person B: Prompt 9 (payouts + notifications)
  End of day: Creator can see campaigns, upload videos, get tracking links
  
DAY 6:
  Both: Prompt 10 (admin panel + polish)
  Both: Run all tests, fix all failures
  Both: Test the full flow: brand creates campaign → creator sees it → 
        uploads video → gets link → tracking logs work
  
DAY 7:
  Morning: Fix every bug found in Day 6 testing
  Afternoon: Deploy to production (Vercel + Railway)
  Evening: YOUR first campaign:
    - Your restaurant = Brand #1 (log in as brand, create ₹2,000 campaign)
    - Your kitchen video = Creator #1 (log in as creator, accept + upload)
    - Get the tracking link, post the video
    - Share: "We just ran the first SceneSwap campaign in our own kitchen"
```

---

*End of document. This is industrial grade.*
*A junior dev reading this knows exactly what to build.*
*A senior dev reading this knows it was built by someone who's shipped before.*
*Now go build it.*
