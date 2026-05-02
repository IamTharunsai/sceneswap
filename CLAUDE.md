# SceneSwap — Claude Code Configuration

## Product Vision
SceneSwap is an **AI-powered video product placement marketplace**. Creators upload their videos, AI analyzes every object in the scene, and inserts the brand's actual product naturally into the video — like real movie product placement, but fully automated. Brands pay CPM, creators earn 70%.

**This is NOT "logo on a wall". It IS "the brand's Pepsi bottle appears on your kitchen counter between cuts".**

**Stack:** Next.js 15 (App Router) · Supabase (Postgres) · Firebase Auth · Cloudflare R2 · Replicate API (Grounding DINO scene analysis) · Modal.com (FFmpeg + OpenCV video compositing) · Razorpay · Resend · Upstash Redis · Turborepo monorepo

**Working directory:** `apps/web/` for the main Next.js app.

## UI/UX Design System — UI UX Pro Max Skill
The project has the **UI UX Pro Max** design skill at `.claude/skills/ui-ux-pro-max/`.

Search it to get design recommendations:
```bash
python .claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "<query>" --domain <style|color|ux|typography> -n 3
```

**Applied design style:** OLED Dark Mode + Modern Dark Cinema
- Background: `#080808` (deep black)
- Accent: `#C8FF00` (electric lime)  
- Cards: subtle glass with `rgba(255,255,255,0.03)` + `backdrop-blur`
- Animations: `cubic-bezier(0.16,1,0.3,1)` easing, 150ms transitions
- Typography: Syne (headings) + DM Sans (body) + Space Mono (metrics)
- All interactive elements have 44px minimum touch targets
- Hover states use `transform + box-shadow` (not width/height)

## gstack

Use `/browse` from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`,
`/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`,
`/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/open-gstack-browser`,
`/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`,
`/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`,
`/pair-agent`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Key Commands

```bash
# Install dependencies
npm install                        # from repo root

# Start dev server
cd apps/web && npm run dev         # http://localhost:3000

# Run tests
npm run test:unit                  # Vitest unit tests
npm run test:e2e                   # Playwright E2E

# Type check
npm run typecheck

# Lint
npm run lint
```

## Architecture Decisions
- **Monorepo:** Turborepo with `apps/web`, `apps/tracking`, `packages/types`, `packages/config`
- **Auth:** Firebase Auth (Google + email) → verified server-side on every API request
- **DB:** Supabase (Postgres) with Row Level Security
- **Storage:** Cloudflare R2 (S3-compatible) for all video/asset storage
- **AI:** Replicate API (SAM2 for surface detection), Modal.com (FFmpeg rendering)
- **Payments:** Razorpay (India-first — add when ready, currently stubbed)
- **Email:** Resend + React Email templates

## Revenue Model
- Brands pay CPM rates (₹300–₹1200/1K views)  
- Creators earn 70%, platform keeps 30%
- All earnings in INR

## Environment Variables
See `.env.example` for the full list. Copy to `.env.local` and fill in real values.

## Code Style
- TypeScript strict mode everywhere
- No `any` types
- Tests alongside every component
- Conventional commits enforced via commitlint
- Prettier + ESLint on every commit (Husky)
