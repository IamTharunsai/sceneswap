# SceneSwap — Full Product Bible & Execution Plan
### "Your Background Pays You"
**Version 1.0 | Built for 2 People | Week 1 Launch Target**

---

## PART 0 — THE DECISION (Read This First)

**The app we are building: SceneSwap**

SceneSwap is an AI-powered marketplace where:
- **Creators** upload videos and mark background surfaces as ad space
- **Brands** bid on those surfaces, targeting by region and audience
- **AI** renders the brand asset (logo/product) into the video background
- **Same video, different brands, per region** — one creator video becomes 50 ad versions

**Why this and not the others:**
- ChatGPT/Claude CANNOT do this. It requires real human networks (creators + brands), physical output (rendered video), and marketplace dynamics
- The viral hook writes itself: "This creator earned ₹12,000 from a video they already posted"
- Two customer types on Day 1: creators (free, supply side) and brands (paying, demand side)
- You can test it yourself — your kitchen, your food content, your brand partners
- No app in the world does this for normal creators at this price point

---

## PART 1 — THE FULL VISION (Think Like Elon)

### The Moonshot in One Sentence
Every screen, every wall, every surface in every video ever made becomes a monetizable advertising real estate — and the person who filmed it owns that real estate.

### The 3-Year Vision
- **Year 1:** Creators upload, brands buy, AI composites. $1M ARR.
- **Year 2:** SceneSwap SDK embedded in TikTok, Instagram, YouTube editors. Revenue share with platforms.
- **Year 3:** Real-time live stream ad injection. Every live creator's background sells space in real time. $50M ARR.

### The Unfair Advantage
You have an F&B business. That means:
- You are the first brand on the platform (your own restaurant)
- Your kitchen content is the first creator supply
- You can walk into any food brand tomorrow and say "I have a demo running in my own restaurant, want in?"
- This is the best possible go-to-market: founder IS the case study

---

## PART 2 — MARKET REALITY CHECK

### Supply Side (Creators)
- TikTok: 1 billion users, 50 million+ active creators
- Instagram Reels: 500 million daily active users
- YouTube Shorts: 70 billion views per day
- India alone: 200M+ short-form video creators
- **The pain:** 95% of creators under 100K followers earn ZERO from their content

### Demand Side (Brands)
- Global digital ad spend 2026: $740 billion
- Influencer marketing market: $24 billion (growing 30% YoY)
- **The pain:** Small and mid brands cannot afford big influencers. SceneSwap lets them buy SURFACES not celebrities.

### Why Now
- AI video compositing just became good enough (Runway ML, SAM2, Replicate APIs)
- Creator economy is at peak frustration — creators want more revenue streams
- Brands are tired of fake influencer metrics — they want CPM-based transparent pricing
- Nobody has built this for the mass market yet

---

## PART 3 — THE TWO USERS (Everything Flows From This)

### User 1: THE CREATOR
**Who they are:**
- Age 16–35
- Posts on Instagram Reels, YouTube Shorts, TikTok
- Has 1,000 – 500,000 followers (the underserved middle)
- Currently earns ₹0 – ₹5,000/month from content
- Spends 3–6 hours making each video

**Their exact pain:**
"I make great content. I work hard. But only mega-influencers get brand deals. Nobody comes to me. I can't afford to wait."

**What SceneSwap gives them:**
- Passive income from every video they upload (even old ones)
- No need to negotiate with brands — it's automated
- No minimum follower count required
- Their existing work starts earning retroactively

**How they find us:**
- One viral post: "I earned ₹8,000 from a wall in my video" → every creator shares this

---

### User 2: THE BRAND / ADVERTISER
**Who they are:**
- Small-to-mid F&B brands, fashion brands, tech accessories, apps, local businesses
- Marketing budget: ₹50,000 – ₹10,00,000/month
- Currently: spending on Google Ads, Instagram ads, influencer deals
- Problem: CPM too high, influencer ROI unclear, can't track real views

**Their exact pain:**
"I paid ₹2 lakh for an influencer post. She posted it. 50K views. I can't prove it sold anything. I can't afford to do this every month."

**What SceneSwap gives them:**
- Pay per 1,000 real views (CPM model — they already understand this)
- Regional targeting built in — only pay for the cities you operate in
- Brand shows up in AUTHENTIC creator content, not obvious ads
- Real-time dashboard: how many views, which regions, which creators

---

## PART 4 — HOW THE PRODUCT WORKS (Full Flow)

### Creator Journey (Step by Step)

```
STEP 1: Sign Up
→ Google/Instagram OAuth login
→ Connect Instagram/YouTube to auto-import video stats
→ Creator profile: name, niche (food/fashion/tech/travel), location

STEP 2: Upload Video
→ Upload MP4 (up to 5 min, up to 2GB)
→ OR paste YouTube/Instagram link (we pull the video)
→ Video thumbnail generated automatically

STEP 3: AI Surface Detection (THE MAGIC MOMENT)
→ AI scans the video
→ Highlights all "ad-ready" surfaces with colored overlay:
   - GREEN: Flat walls/backgrounds (poster/banner placement)
   - BLUE: Objects (cups, bottles, bags — logo/label swap)
   - YELLOW: Screens/TVs (digital display ads)
   - ORANGE: Apparel (t-shirt logo, cap logo)
→ Creator sees their video with glowing surface zones
→ They tap each zone to "activate" it for monetization

STEP 4: Set Preferences
→ For each surface: set minimum CPM (e.g. ₹500 minimum per 1000 views)
→ Choose allowed brand categories: (Food ✓, Alcohol ✗, Pharma ✗)
→ Choose allowed regions: (India only / Global / Specific states)

STEP 5: Go Live
→ Creator publishes to SceneSwap marketplace
→ Brands can now see and bid on this video's surfaces
→ Creator gets notified when a brand wins a slot: "Swiggy bought your wall for ₹1,200"

STEP 6: Get Paid
→ Video rendered with brand asset composited in
→ Creator posts rendered version to Instagram/TikTok
→ Views tracked via pixel/link
→ Earnings deposited weekly to UPI/bank account
```

---

### Brand Journey (Step by Step)

```
STEP 1: Sign Up
→ Business email, GST number (India), brand category
→ Upload brand kit: logo (PNG), brand colors, product images, video clips

STEP 2: Browse Creator Marketplace
→ Filter by:
   - Niche (food, fashion, travel, tech, lifestyle)
   - Audience location (city, state, country)
   - Estimated reach (follower count range)
   - Surface type (wall / object / screen / apparel)
   - CPM range (₹300 – ₹5000 per 1000 views)

STEP 3: Pick a Video + Surface
→ See the video with available surfaces highlighted
→ See creator's audience demographics (pulled from Instagram API)
→ See estimated reach and cost

STEP 4: Configure Ad Placement
→ Upload brand asset (logo / product image / short video clip)
→ Set which region sees this ad (e.g. Mumbai only)
→ Set start/end date for campaign
→ Preview: see a mockup of what the brand will look like in the video

STEP 5: Pay and Launch
→ Add to cart (can buy multiple surfaces across multiple creators)
→ Pay via Razorpay (UPI, card, net banking)
→ Campaign goes live within 24 hours after AI rendering

STEP 6: Track Results
→ Dashboard: total views, region breakdown, click-throughs (if link in bio)
→ Compare CPM vs Google/Meta ads
→ Download PDF report for client/boss
```

---

## PART 5 — HOW WE KNOW CREATORS WILL UPLOAD

This is the right question. Here's how you validate BEFORE building everything:

### Week 0 Validation Plan (Before You Write a Single Line of Code)

**Day 1–2: The Fake Door Test**
- Build a simple landing page (one page, no backend)
- Headline: "Turn your video backgrounds into income. Beta launching soon."
- Two buttons: "I'm a Creator — Join Waitlist" and "I'm a Brand — Get Early Access"
- Put an email capture form. That's it.
- Cost: ₹0. Time: 2 hours with Claude Code.

**Day 3–4: Post in these exact places**
- Instagram: Story + Reel showing "what if your wall could pay you?"
- Reddit: r/NewTubers, r/InstagramMarketing, r/startups, r/india
- LinkedIn: "We're building something for creators who aren't mega-influencers"
- WhatsApp: Every creator group you're in
- Product Hunt: "Coming Soon" page

**Day 5–7: Count emails**
- If 200+ creators sign up in 7 days → BUILD
- If 20 brands express interest → BUILD IMMEDIATELY
- If under 50 total signups → PIVOT THE MESSAGING (not the idea)

**The honest truth:**
The product is real. The question is just messaging. Every creator on earth wants passive income. The signup will come — your job is to make the hook hit hard.

---

## PART 6 — REVENUE MODEL (Every Rupee Explained)

### How Money Flows

```
Brand pays ₹10,000 for a campaign
→ ₹7,000 goes to Creator (70%)
→ ₹3,000 stays with SceneSwap (30%)
```

### Pricing Tiers for Brands

| Tier | CPM Rate | Minimum Spend | Surface Type |
|------|----------|---------------|--------------|
| Starter | ₹300/1K views | ₹2,000 | Wall/background |
| Standard | ₹600/1K views | ₹5,000 | Object/product |
| Premium | ₹1,200/1K views | ₹15,000 | Screen/apparel |
| Enterprise | Custom | ₹1,00,000+ | Full video takeover |

### Monthly Revenue Projections

**Month 1 (You + 10 creators, 3 brands):**
- 10 creators × average 30K views × ₹500 CPM = ₹1,50,000 brand spend
- SceneSwap 30% = ₹45,000
- Goal: Prove the model works

**Month 3 (100 creators, 20 brands):**
- ₹15,00,000 brand spend
- SceneSwap revenue = ₹4,50,000/month

**Month 6 (1000 creators, 100 brands):**
- ₹1.5 Crore brand spend
- SceneSwap revenue = ₹45,00,000/month

### Additional Revenue Streams (Add Later)
1. **Boost Fee:** Brand pays extra ₹500 to prioritize their placement in marketplace
2. **Analytics Pro:** Brands pay ₹2,000/month for advanced attribution reports
3. **Creator Pro:** Creators pay ₹199/month for priority placement in brand browsing
4. **Rendering Credits:** Heavy users pay for faster rendering queue

---

## PART 7 — GO-TO-MARKET (How You Get Your First 100 Creators and 10 Brands)

### Phase 1: Founder-Led (Week 1–4)

**Your kitchen is the first campaign:**
- You (founder) upload your food content to SceneSwap
- You approach 3 local F&B brands: "I'll put your logo in my cooking videos, free, first month"
- You film it, post it, show the result publicly
- Post on LinkedIn: "We ran the first ever SceneSwap campaign in our own kitchen. Here's what happened."
- This becomes your launch story

**Find 10 Seed Creators:**
- DM 50 food/travel/lifestyle creators with 5K–50K followers on Instagram
- Message: "You're exactly the kind of creator SceneSwap is built for. Can I give you free early access? Your background could earn you ₹5,000–₹50,000/month."
- Target 10 who reply and post

**Find 5 Seed Brands:**
- Local restaurant chains, beverage brands, clothing brands in your city
- Walk in physically. Show the mockup. First campaign at 50% discount.
- Target: 5 brands paying ₹5,000–₹20,000 each for Month 1

---

### Phase 2: Community-Led (Month 2–3)

**Content That Spreads:**
1. "Creator earns ₹X from a video they posted 3 months ago" (case study)
2. Before/after video: plain background → branded background (shocking visual)
3. "Every creator with a wall is sitting on money they don't know about"
4. Live demo: "Watch me turn this cooking video into ₹8,000 in 10 minutes"

**Platforms to Attack:**
- Instagram Reels (before/after transformation video)
- LinkedIn (brand ROI story for marketers)
- Reddit r/InstagramMarketing, r/YoutubeCreators, r/digitalnomad
- Twitter/X creator communities
- YouTube: "I made ₹50,000 from my video backgrounds — here's how"

**Partnerships:**
- Creator economy newsletters (email sponsorship ₹5,000 flat)
- 3 mid-size creator community Discord/WhatsApp groups → post there
- Reach out to 5 digital marketing agencies → white-label pitch

---

### Phase 3: Performance Marketing (Month 4+)

**Meta Ads:**
- Target: Instagram creators (interest: content creation, monetization)
- Creative: Video showing the earnings dashboard
- CTA: "Join 1,000 creators already earning from their backgrounds"

**LinkedIn Ads:**
- Target: Marketing managers, brand managers at F&B, FMCG, retail companies
- Creative: "Your brand in 10,000 food videos this month. Starting ₹2,000."

**Key Metric to Track:**
- Cost to acquire 1 creator (target: under ₹200)
- Cost to acquire 1 brand (target: under ₹2,000)
- Payback period: first brand campaign pays back all acquisition costs

---

## PART 8 — TECHNICAL ARCHITECTURE (Full Stack)

### The Two Apps You're Building

```
App 1: Creator Portal (Web, Mobile-Responsive)
App 2: Brand Dashboard (Web, Desktop-First)

Shared: API Backend + Database + AI Pipeline
```

---

### Tech Stack (Every Tool Named)

**Frontend**
- Framework: Next.js 14 (React, SSR for SEO)
- Styling: Tailwind CSS + custom CSS variables
- Animation: Framer Motion
- Video Player: Video.js
- Canvas/Overlay Tool: Konva.js (for surface marking)
- State: Zustand

**Backend**
- Runtime: Node.js with Express
- API: REST + WebSocket for real-time notifications
- Auth: Firebase Authentication (Google + Email)

**Database**
- Primary: PostgreSQL (Supabase — free tier to start)
- File Storage: Cloudflare R2 (cheaper than S3, same API)
- Cache: Redis (Upstash — serverless, free tier)

**AI Pipeline**
- Object/Surface Detection: Replicate API → SAM2 (Meta's Segment Anything Model)
- Video Compositing: Replicate API → RunwayML Gen-3 or FFmpeg + OpenCV
- Background rendering: Custom FFmpeg pipeline on Modal.com (serverless GPU)
- Claude API: For auto-generating campaign descriptions, brand-matching suggestions

**Payments**
- India: Razorpay (UPI, cards, net banking, payouts)
- Global (later): Stripe

**Infrastructure**
- Frontend: Vercel (free tier → Pro at scale)
- Backend: Railway.app ($5/month to start)
- GPU Jobs: Modal.com (pay per second of GPU use)
- Email: Resend.com (transactional emails, free 3K/month)
- Analytics: PostHog (open source, free)

**Third-Party APIs**
- Instagram Basic Display API (pull creator stats)
- YouTube Data API v3 (pull video metrics)
- Razorpay Payout API (send money to creators)

---

### System Architecture Diagram

```
CREATOR                          SCENESWAP BACKEND                    BRAND
   |                                     |                               |
   | Upload Video                        |                               |
   |------------------------------------>|                               |
   |                          Store video in R2                          |
   |                          Trigger SAM2 on Replicate                  |
   |                          Return surface zones JSON                  |
   |<------------------------------------|                               |
   | See glowing zones                   |                               |
   | Mark surfaces + set CPM             |                               |
   |------------------------------------>|                               |
   |                          Save to Postgres                           |
   |                          List in Marketplace                        |
   |                                     |<----- Brand browses & picks --|
   |                                     |<----- Brand uploads asset ----|
   |                                     |<----- Brand pays Razorpay ----|
   |                          Trigger FFmpeg + GPU render               |
   |                          Composite brand into video                 |
   |                          Generate region-specific versions          |
   | Notified: "Swiggy bought your wall" |                               |
   |<------------------------------------|                               |
   | Download final video               |                               |
   | Post to Instagram/TikTok           |                               |
   |                          Track views via UTM links                  |
   |                          Update brand dashboard CPM               |
   |                          Pay creator via Razorpay payout           |
```

---

## PART 9 — BRAND IDENTITY (Design Bible)

### Name
**SceneSwap** — two words, visual, verb+noun, instantly explains what it does

### Tagline
**"Your Background Pays You"**

### Brand Personality
- Bold and confident (not corporate)
- Creative and edgy (for creators)
- Data-driven and trustworthy (for brands)
- Think: between Canva and Stripe in personality

---

### Color Palette

```css
:root {
  /* Primary */
  --color-black: #0A0A0A;         /* Near-black backgrounds */
  --color-white: #F5F4F0;         /* Warm white, not pure white */

  /* Brand Accent — Electric Lime */
  --color-primary: #C8FF00;       /* The HERO color. Highlighter yellow-green. */
  --color-primary-dark: #9DCC00;  /* Hover states */

  /* Secondary Accent — Deep Violet */
  --color-secondary: #6B21FF;     /* CTAs, links, AI elements */
  --color-secondary-light: #A78BFA; /* Hover states */

  /* Surface Colors */
  --color-surface-1: #141414;     /* Card backgrounds (dark mode) */
  --color-surface-2: #1F1F1F;     /* Input backgrounds */
  --color-surface-3: #2A2A2A;     /* Borders, dividers */

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Text */
  --color-text-primary: #F5F4F0;
  --color-text-secondary: #A0A0A0;
  --color-text-muted: #6B6B6B;
}
```

**Why Electric Lime (#C8FF00)?**
It's the color of money in neon. It screams "earning." It's associated with highlighters — marking things that matter. No major creator platform uses it. It will be instantly recognizable.

---

### Typography

```css
/* Display / Hero Headlines */
font-family: 'Syne', sans-serif;
/* Bold, geometric, futuristic — feels like a creative tech brand */
/* Google Fonts: https://fonts.google.com/specimen/Syne */

/* Body / UI Text */
font-family: 'DM Sans', sans-serif;
/* Clean, modern, extremely readable at small sizes */
/* Google Fonts: https://fonts.google.com/specimen/DM+Sans */

/* Numbers / Metrics / Earnings */
font-family: 'Space Mono', monospace;
/* Makes numbers feel like data, like a Bloomberg terminal */
/* Google Fonts: https://fonts.google.com/specimen/Space+Mono */
```

**Type Scale:**
```css
--text-hero: 72px / bold / Syne          /* "Your Background Pays You" */
--text-h1: 48px / bold / Syne            /* Section headers */
--text-h2: 32px / semibold / Syne        /* Card titles */
--text-h3: 24px / semibold / DM Sans     /* Sub-sections */
--text-body: 16px / regular / DM Sans    /* Body text */
--text-small: 14px / regular / DM Sans   /* Labels, captions */
--text-metric: 40px / bold / Space Mono  /* ₹12,400 earned */
```

---

### Logo Concept
```
[ ◈ SceneSwap ]

The ◈ symbol = a square with a target/crosshair inside
= represents "marking a surface in a video"
= in Electric Lime on black
= simple enough to work at 16px favicon size
```

### Visual Style Rules
1. **Dark mode first** — creator tools are dark. Always.
2. **Electric Lime is used SPARINGLY** — only on primary CTAs, earnings numbers, and hero text. Never fill a whole section with it.
3. **Lots of breathing room** — generous padding (min 48px sections)
4. **Video thumbnails have glowing borders** — show the "surface marking" visual language throughout the UI
5. **Numbers are always Space Mono** — earnings, CPM rates, view counts feel like real data
6. **Rounded corners: 12px** — modern, friendly, not sharp corporate
7. **Shadows: no box shadows** — use glow effects instead (Electric Lime glow on hover states)

---

## PART 10 — SCREENS TO BUILD (Every Page Listed)

### Creator Side

**1. Landing Page (Public)**
- Hero: Full-screen dark background, headline "Your Background Pays You" in Syne Bold 72px Electric Lime
- Sub: "Upload your video. Our AI finds the ad surfaces. Brands pay you per view."
- CTA: "Start Earning Free" (Electric Lime button)
- Social proof: "1,200 creators earning. 85 brands running campaigns"
- How it works: 3 steps with animation
- Demo video: 30-second screen recording of the product working
- Creator testimonials with earnings screenshots
- Footer with links

**2. Creator Onboarding (4 screens)**
- Screen 1: Sign up with Google
- Screen 2: Connect Instagram/YouTube (or skip)
- Screen 3: Choose your niche (food/fashion/travel/tech/lifestyle/other)
- Screen 4: "Your dashboard is ready!" with first upload CTA

**3. Creator Dashboard**
- Top bar: Total earnings this month (Space Mono, Electric Lime)
- Active campaigns running
- Video library grid
- "Upload New Video" big button
- Earnings history chart
- Payout status + bank details

**4. Video Upload + Surface Marking (THE KEY SCREEN)**
- Left side: Video player with frame scrubber
- Right side: Surface zones listed (Wall #1, Cup #1, Screen #1)
- Glowing overlays on video showing detected surfaces
- Click each zone to:
  - Set minimum CPM
  - Set allowed brand categories
  - Set allowed regions
- "Publish to Marketplace" button

**5. Creator Earnings Detail**
- Per video earnings breakdown
- Which brand paid for which surface
- View count vs earnings chart
- "Share your earnings" button (for viral social proof)

---

### Brand Side

**6. Brand Landing Page (Public — separate from creator landing)**
- Headline: "Place Your Brand in 10,000 Videos. Pay Only for Real Views."
- Sub: "Target by region. Pay per CPM. Cancel anytime."
- CTA: "Start Your First Campaign — ₹2,000 Minimum"
- Show: mockup of brand in food video, gaming video, fashion video
- Pricing table
- "Book a Demo" for enterprise

**7. Brand Onboarding**
- Business name, category, GST, logo upload
- Add ₹5,000 to wallet (minimum first deposit)
- Short tour of dashboard

**8. Brand Campaign Builder**
- Step 1: Upload brand asset (logo / image / 3-second video clip)
- Step 2: Set targeting (region, creator niche, surface type)
- Step 3: Set budget (total spend + max CPM)
- Step 4: Browse matching creators (filtered list with preview)
- Step 5: Confirm + Pay

**9. Brand Dashboard**
- Active campaigns with live view counts
- Spend vs budget chart
- Top performing creators
- CPM comparison: "Your SceneSwap CPM vs your Meta CPM"
- Download report button

**10. Admin Panel (Internal, for you)**
- All creators list + their video library
- All brand campaigns + status
- Rendering job queue + status
- Revenue today / this week / this month
- Manual override: approve/reject campaigns

---

## PART 11 — THE 7-DAY BUILD PLAN

### Pre-Day 0: Setup (2 hours)
```
□ Buy domain: sceneswap.com or scenswap.in (GoDaddy/Namecheap ~₹800/year)
□ Create GitHub repo: sceneswap-app
□ Set up Supabase project (free tier)
□ Set up Vercel account + connect GitHub
□ Set up Railway.app for backend
□ Create Razorpay account (takes 2–3 days to verify — do this NOW)
□ Create Replicate account (for AI APIs)
□ Create Modal.com account (for GPU rendering)
□ Set up Resend.com for emails
□ Create PostHog account for analytics
```

### Day 1: Foundation + Landing Page
```
□ Next.js project setup with Tailwind
□ Import Syne + DM Sans + Space Mono from Google Fonts
□ Set up CSS variables (full color system from Part 9)
□ Build landing page — creator version
□ Build landing page — brand version
□ Email waitlist capture (Supabase table)
□ Deploy to Vercel
□ Start sharing waitlist link immediately
```

### Day 2: Auth + Creator Dashboard Shell
```
□ Firebase Auth setup (Google login)
□ User table in Supabase (id, email, role: creator/brand, created_at)
□ Creator profile table (niche, Instagram handle, YouTube handle)
□ Creator dashboard layout (sidebar + main content area)
□ Empty states for all dashboard sections
```

### Day 3: Video Upload + AI Surface Detection
```
□ Video upload to Cloudflare R2 (direct upload, not through server)
□ Trigger Replicate API call with video URL → SAM2 model
□ Parse response: get surface zones as bounding boxes per frame
□ Store zones in Supabase (video_id, zone_type, coordinates, frame_range)
□ Show zones as colored overlays on video player (Konva.js canvas layer)
□ Creator can click zones to name them and set CPM preferences
```

### Day 4: Brand Portal + Marketplace
```
□ Brand onboarding flow (4 screens)
□ Brand asset upload (logo/image to R2)
□ Creator video marketplace page (grid with filters)
□ Filter by: niche, region, CPM range, surface type
□ Video detail page: shows creator stats + available surfaces + cost estimate
□ "Add to Campaign" cart flow
```

### Day 5: Payment + Campaign Launch
```
□ Razorpay payment integration (brand deposits ₹2,000 minimum to wallet)
□ Campaign creation → deducts from wallet
□ Trigger rendering pipeline when campaign paid:
   → Send video URL + brand asset + zone coordinates to Modal.com
   → FFmpeg composites brand into video at correct zone
   → Store rendered video in R2
   → Notify creator via email + in-app notification
□ Creator downloads rendered video
```

### Day 6: Tracking + Payouts
```
□ UTM link generator: creator gets unique tracking link for their video post
□ Basic view tracking: when link clicked, log in Supabase
□ Brand dashboard: show live view count + CPM spent
□ Creator earnings calculation: views × CPM × 0.70
□ Razorpay Payout API: trigger payout to creator bank account
□ Earnings history page for creator
```

### Day 7: Polish + Launch
```
□ Mobile responsiveness check (creator side must work on phone)
□ Error states, loading states, empty states for all screens
□ Onboarding email sequence (Resend.com):
   - Creator Day 1: "Welcome — here's how to upload your first video"
   - Brand Day 1: "Your campaign setup guide"
□ Admin panel basics (view all users, all campaigns, all revenues)
□ Fix top 10 bugs from internal testing
□ LAUNCH: Post to Reddit, LinkedIn, Instagram, WhatsApp groups
```

---

## PART 12 — CLAUDE CODE INSTRUCTIONS

When you paste this document into Claude Code, use these exact prompts in sequence:

### Prompt 1 — Project Setup
```
"Read this PRD document fully. Now set up a Next.js 14 project with:
- Tailwind CSS configured
- Google Fonts: Syne, DM Sans, Space Mono
- CSS variables from the color palette in Part 9
- Folder structure: /app (Next.js pages), /components, /lib, /api
- Supabase client setup
- Firebase Auth setup
First build the landing page exactly as described in Part 10, Screen 1."
```

### Prompt 2 — Video Upload Screen
```
"Build the video upload and surface marking screen (Screen 4 in Part 10).
Use Konva.js for the canvas overlay on the video player.
Surfaces should glow in these colors:
- Wall surfaces: Electric Lime (#C8FF00) glow
- Object surfaces: Violet (#6B21FF) glow
- Screen surfaces: Blue (#3B82F6) glow
The right panel lists each detected zone and lets creator set CPM and preferences."
```

### Prompt 3 — Brand Dashboard
```
"Build the Brand Campaign Builder (Screen 8 in Part 10).
It should be a 5-step wizard with progress indicator at the top.
Use the dark color scheme with Space Mono for all number displays.
The creator browsing step should show a grid of video cards with Electric Lime
badges showing CPM prices."
```

Continue this pattern — give Claude Code one screen at a time with full context.

---

## PART 13 — METRICS THAT MATTER (Weekly Review)

Track these every Friday, no excuses:

| Metric | Week 1 Target | Month 1 Target | Month 3 Target |
|--------|--------------|----------------|----------------|
| Creator signups | 20 | 100 | 1,000 |
| Videos uploaded | 10 | 75 | 800 |
| Brand signups | 3 | 15 | 100 |
| Campaigns live | 1 | 10 | 80 |
| Total GMV (brand spend) | ₹10,000 | ₹1,50,000 | ₹15,00,000 |
| SceneSwap revenue (30%) | ₹3,000 | ₹45,000 | ₹4,50,000 |
| Creator payouts | ₹7,000 | ₹1,05,000 | ₹10,50,000 |

---

## PART 14 — THE FIRST WEEK REALITY CHECKLIST

### Before You Code Anything:
- [ ] Register your domain today
- [ ] Apply for Razorpay merchant account today (takes 48 hours to verify)
- [ ] Message 20 creator friends/contacts about SceneSwap TODAY
- [ ] Message 5 local brand/business contacts about advertising TODAY
- [ ] Set up your GitHub repo and Vercel project

### After Day 1 of Coding:
- [ ] Share the landing page publicly — even if it's just email capture
- [ ] Post "We're building SceneSwap" on LinkedIn with the concept
- [ ] Film your first SceneSwap-concept video in your kitchen
  (even before the app is ready — show the concept manually with editing)

### The One Non-Negotiable:
You must have ONE real creator and ONE real brand by Day 7.
Even if you are the creator and your own restaurant is the brand.
A real transaction — even ₹500 — proves the model.

---

## PART 15 — WHAT JEFF / STEVE / ELON WOULD ASK YOU

**Jeff Bezos would ask:** "What is the customer experience 10 years from now, and are you working backward from that?"
→ Answer: Every video ever made has ad-ready surfaces. SceneSwap is the exchange layer for that inventory. We work backward from being the NYSE of video ad surfaces.

**Steve Jobs would ask:** "What are you removing? What is the one thing?"
→ Answer: We are removing the "you need 1 million followers to earn" requirement. One surface. One view. One rupee. That's the one thing.

**Elon Musk would ask:** "What's the physics limit? What would have to be true for this to fail?"
→ Answer: If AI compositing quality is visibly fake, brands won't pay. So quality of the rendering IS the product. We invest in rendering quality before everything else.

---

*Document ends. Start building.*
*The only mistake is waiting.*
