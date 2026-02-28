# SDLC Documentation — Alfred Tech Solutions Facebook Automation System

**Version:** 1.0.0  
**Project:** Alfred Tech Facebook Auto-Poster  
**Repository:** github.com/sibby-killer/alfredtechposter  
**Last Updated:** February 2026

---

## 1. PROJECT OVERVIEW

### 1.1 System Description
The Alfred Tech Solutions Facebook Automation System is a fully automated social media marketing pipeline designed to generate, post, and engage with content on the Alfred Tech Solutions Facebook Business Page. It posts 8 times per day using AI-generated captions and images tailored for web design and automation service promotion.

### 1.2 Business Objectives
- Establish Alfred Tech Solutions as a top-of-mind web design & automation brand in Kenya
- Attract warm inbound leads via consistent Facebook engagement
- Convert followers to paying clients through strategic CTAs and WhatsApp intake
- Reduce manual marketing effort to zero — fully automated

### 1.3 Key Stakeholders
| Role | Name | Responsibility |
|------|------|---------------|
| Product Owner | Alfred (sibby-killer) | Requirements, content approval |
| Developer | Alfred Tech Solutions | System design & implementation |
| AI Pair | Antigravity (Google DeepMind) | Architecture & development |

---

## 2. REQUIREMENTS

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | System shall post 8 times daily to Facebook Page | High |
| FR-02 | Each post shall have a unique AI-generated caption | High |
| FR-03 | Each post shall have a relevant AI-generated image | High |
| FR-04 | Problem posts shall auto-comment the solution | High |
| FR-05 | All posts shall include follow CTA | Medium |
| FR-06 | System shall rotate across 7 business niches | Medium |
| FR-07 | System shall fallback to text-only if image fails | High |
| FR-08 | System shall schedule automatically via CRON | High |

### 2.2 Non-Functional Requirements

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-01 | Zero hosting cost | $0/month |
| NFR-02 | Zero watermarks on images | Verified |
| NFR-03 | Posts must not sound AI-generated | Human tone enforced via prompts |
| NFR-04 | Fault tolerance | Never crash — fallback to text-only |
| NFR-05 | Scheduling accuracy | ±5 minutes via GitHub Actions |

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions (CRON)                   │
│              Triggers 8× daily (EAT times)               │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   index.js           │
              │   Main Orchestrator  │
              └──────┬────────┬─────┘
                     │        │
         ┌───────────▼─┐  ┌───▼──────────────┐
         │generate-    │  │generate-image.js  │
         │caption.js   │  │                   │
         │(Groq AI)    │  │Pollinations.ai    │
         │Llama 3.3    │  │Flux Model         │
         └───────────┬─┘  └───┬───────────────┘
                     │        │
              ┌──────▼────────▼──────┐
              │  post-to-facebook.js  │
              │  Facebook Graph API   │
              │  v22.0                │
              └──────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Facebook   │
                  │  Page Post  │
                  │  (+ Comment │
                  │  if problem)│
                  └─────────────┘
```

### 3.2 Component Details

| Component | File | Technology | Purpose |
|-----------|------|-----------|---------|
| Orchestrator | `src/index.js` | Node.js | Coordinates the full pipeline |
| Caption Generator | `src/generate-caption.js` | Groq + Llama 3.3 | Creates 8 types of AI captions |
| Image Generator | `src/generate-image.js` | Pollinations.ai Flux | Generates 1080×1080 images |
| Facebook Client | `src/post-to-facebook.js` | Graph API v22 | Posts content and comments |
| Scheduler | `.github/workflows/post.yml` | GitHub Actions CRON | Triggers 8× daily |
| Config | `.env` | dotenv | Stores API credentials |

---

## 4. CONTENT STRATEGY

### 4.1 Post Types (8 Daily)

| # | Type | Goal | Auto-Comment? |
|---|------|------|--------------|
| 1 | Portfolio Showcase | Build credibility | No |
| 2 | Tips & Tricks | Provide value | No |
| 3 | Automation Showcase | Service awareness | No |
| 4 | Before/After | Show transformation | No |
| 5 | Pricing/Services | Direct conversion | No |
| 6 | Social Proof | Build trust | No |
| 7 | Problem Post | Drive engagement | ✅ YES |
| 8 | Fun Fact | Shareability | No |

### 4.2 Niche Rotation (7 Niches)
1. Restaurant / Food Business
2. Real Estate Agency
3. Salon & Beauty
4. Church / NGO
5. E-commerce Shop
6. Professional Services
7. School / Academy

### 4.3 Automation Niches (7 Types)
1. WhatsApp Auto-Reply Bot
2. Social Media Auto-Posting
3. Invoice Generator
4. Lead Collection System
5. Auto Email Notifications
6. Google Sheets Automation
7. CRM & Dashboard

---

## 5. APIs & INTEGRATIONS

### 5.1 Facebook Graph API v22.0

| Endpoint | Purpose | Permission Required |
|----------|---------|-------------------|
| `POST /{pageId}/feed` | Text post | `pages_manage_posts` |
| `POST /{pageId}/photos` | Photo post | `pages_manage_posts` |
| `POST /{postId}/comments` | Auto-comment | `pages_manage_engagement` |
| `GET /{pageId}` | Connection test | `pages_read_engagement` |

**Token Type:** Long-lived Page Access Token (~60 days)  
**Refresh Strategy:** Manual re-generation every 55 days

### 5.2 Groq API (Llama 3.3-70b-versatile)

| Parameter | Value |
|-----------|-------|
| Model | `llama-3.3-70b-versatile` |
| Temperature | 0.85 (creative but controlled) |
| Max tokens | 400 per caption |
| Rate limit | Free tier: 30 req/min |

### 5.3 Pollinations.ai (Flux Model)

| Parameter | Value |
|-----------|-------|
| Endpoint | `image.pollinations.ai/prompt/{prompt}` |
| Auth | `Authorization: Bearer sk_...` + `?key=sk_...` |
| Resolution | 1080×1080 px |
| Model | `flux` |
| Logo | `nologo=true` |
| Key Type | Secret Key (`sk_`) — no rate limits |

---

## 6. DEVELOPMENT PHASES

### 6.1 Phase 1 — Planning & Research ✅ COMPLETE
- [x] Market research (finytab page analysis)
- [x] Content strategy definition (7→8 post types)
- [x] Tech stack selection (Groq + Pollinations + GitHub Actions)
- [x] Facebook API research (v22.0 permissions)
- [x] Business branding (Alfred Tech Solutions)

### 6.2 Phase 2 — Facebook API Setup ✅ COMPLETE
- [x] Create Facebook Business Page
- [x] Create Meta Developer App (`AlfredTechPoster`)
- [x] Add Use Case: "Manage everything on your Page"
- [x] Generate Page Access Token
- [x] Verify posting permissions

### 6.3 Phase 3 — Core Automation ✅ COMPLETE
- [x] Node.js project setup
- [x] Groq AI caption generator (8 post types)
- [x] Pollinations.ai image generator (with auth + retries)
- [x] Facebook post publisher
- [x] Auto-comment system (problem posts)
- [x] Main orchestrator
- [x] Full pipeline test — POSTS LIVE ✅

### 6.4 Phase 4 — GitHub Actions ⏳ IN PROGRESS
- [x] Workflow YAML (8× daily CRON)
- [x] Code pushed to GitHub
- [ ] Repository secrets configured
- [ ] First scheduled run verified

### 6.5 Phase 5 — Landing Page 📋 PLANNED
- [ ] HTML/CSS landing page
- [ ] Service pricing section
- [ ] WhatsApp CTA intake form
- [ ] Portfolio mockup gallery
- [ ] Deploy to GitHub Pages

### 6.6 Phase 6 — Group Forwarding 📋 PLANNED
- [ ] Playwright browser automation
- [ ] Group list manager
- [ ] Share to groups after each post
- [ ] Rate limiting (avoid Facebook ban)

### 6.7 Phase 7 — Admin Panel 📋 PLANNED
- [ ] Web dashboard (view posts, analytics)
- [ ] Manual post trigger
- [ ] Token refresh interface
- [ ] Content calendar view

---

## 7. DEPLOYMENT

### 7.1 Local Development
```bash
git clone https://github.com/sibby-killer/alfredtechposter.git
cd alfredtechposter
npm install
cp .env.example .env   # Fill in your keys
node src/test-post.js  # Verify connection
node src/index.js 1    # Run post #1
```

### 7.2 Production (GitHub Actions)
1. Push code to `main` branch
2. Add 4 GitHub Secrets (FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, GROQ_API_KEY, POLLINATIONS_API_KEY)
3. Workflow auto-runs on schedule

### 7.3 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FB_PAGE_ID` | ✅ | Facebook Page numeric ID |
| `FB_PAGE_ACCESS_TOKEN` | ✅ | Long-lived Page Access Token |
| `GROQ_API_KEY` | ✅ | Groq API key (gsk_...) |
| `POLLINATIONS_API_KEY` | ✅ | Pollinations.ai secret key (sk_...) |
| `BUSINESS_NAME` | Optional | Business name for posts |
| `BUSINESS_PHONE` | Optional | Phone for CTAs |
| `BUSINESS_EMAIL` | Optional | Email for CTAs |
| `LANDING_PAGE_URL` | Optional | Link in posts |

---

## 8. TESTING

### 8.1 Test Checklist

| Test | Command | Expected Result |
|------|---------|----------------|
| Facebook connection | `node src/test-post.js` | Page name prints, test post live |
| Caption generator | `node -e "require('./src/generate-caption').generateCaption('tips_tricks','Restaurant','WhatsApp Bot',1).then(console.log)"` | 150-word caption printed |
| Image generator | `node -e "require('./src/generate-image').generateImage('portfolio_website','Restaurant','test.jpg').then(console.log)"` | Image saved to generated-images/ |
| Full pipeline | `node src/index.js 1` | Post live on Facebook with image |
| Problem post | `node src/index.js 7` | Post + auto-comment live |

### 8.2 Known Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Pollinations 530 error | Cloudflare blocking unauthenticated requests | Use Bearer token + ?key= param |
| `manage_pages` invalid scope | Deprecated permission | Use `pages_manage_posts` instead |
| Token expiry | Access tokens last ~60 days | Manually refresh every 55 days |

---

## 9. MAINTENANCE

### 9.1 Token Refresh (Every 55 Days)
1. Go to: `developers.facebook.com/tools/explorer`
2. Generate new token with `pages_manage_posts` & `pages_manage_engagement`
3. Run: `me/accounts?access_token=NEW_TOKEN`
4. Copy new Page Access Token
5. Update GitHub Secret: `FB_PAGE_ACCESS_TOKEN`

### 9.2 Groq API Limits
- Free tier: 30 requests/minute, 14,400/day
- Our usage: 8-10 requests/day (well within limits)

### 9.3 GitHub Actions Minutes
- Free tier: 2,000 minutes/month
- Our usage: ~8 runs × ~3 min = 24 min/day = ~720 min/month (well within limits)

---

## 10. FUTURE ROADMAP

| Feature | Priority | Est. Effort |
|---------|----------|-------------|
| Landing Page with WhatsApp CTA | High | 1 day |
| Group Forwarding (Playwright) | High | 2 days |
| Admin Panel Dashboard | Medium | 3 days |
| WhatsApp Business API auto-reply | Medium | 2 days |
| Instagram cross-posting | Low | 1 day |
| Token auto-refresh system | Medium | 1 day |
| Post performance analytics | Low | 2 days |

---

*Documentation maintained by Alfred Tech Solutions — alfred.dev8@gmail.com*
