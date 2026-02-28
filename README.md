# Alfred Tech Solutions — Facebook Automation System

<div align="center">

![Alfred Tech Solutions](https://img.shields.io/badge/Alfred%20Tech-Solutions-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![Facebook API](https://img.shields.io/badge/Facebook-Graph%20API%20v22-1877F2?style=for-the-badge&logo=facebook)
![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3-orange?style=for-the-badge)
![Pollinations](https://img.shields.io/badge/Pollinations.ai-Image%20Gen-purple?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-black?style=for-the-badge&logo=github)

**An intelligent, fully automated Facebook marketing system that generates and posts 8 branded pieces of content daily to the Alfred Tech Solutions Facebook Page — completely free to run.**

</div>

---

## 🚀 Features

- **8 Posts Per Day** — Auto-scheduled across peak engagement times (EAT timezone)
- **AI-Generated Captions** — Groq (Llama 3.3) writes human-like, non-spammy posts
- **AI-Generated Images** — Pollinations.ai creates unique branded visuals per post
- **Problem Posts + Auto-Comments** — Posts a pain point, then instantly comments the solution (drives massive engagement)
- **Follow CTAs** — Every post includes a page follow call-to-action
- **Niche Rotation** — Content rotates across 7 business niches daily
- **GitHub Actions Scheduler** — 100% free cloud-based scheduling, no server needed
- **Graceful Fallback** — If image generation fails, posts text-only (never crashes)

---

## 📅 Daily Post Schedule (EAT — Nairobi Time)

| Time | Post Type | Purpose |
|------|-----------|---------|
| 7:00 AM | 🖼️ Portfolio Showcase | Show client work |
| 9:00 AM | 💡 Tips & Tricks | Educate + build trust |
| 11:00 AM | 🤖 Automation Showcase | Service promotion |
| 1:00 PM | 🔄 Before/After | Transformation story |
| 3:00 PM | 💰 Pricing/Services | Direct sales |
| 5:00 PM | ⭐ Social Proof | Testimonial |
| 7:00 PM | ❓ Problem Post + 💬 Auto-Comment | Engagement driver |
| 9:00 PM | 🎯 Fun Fact | Shareability |

---

## 🛠️ Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Caption Generation | Groq API (Llama 3.3-70b) | ✅ Free |
| Image Generation | Pollinations.ai (Flux model) | ✅ Free with sk_ key |
| Facebook Posting | Facebook Graph API v22.0 | ✅ Free |
| Scheduling | GitHub Actions CRON | ✅ Free (2000 min/month) |
| Auto-commenting | Facebook Graph API | ✅ Free |

---

## 📁 Project Structure

```
alfredtechposter/
├── src/
│   ├── index.js              # Main orchestrator
│   ├── generate-caption.js   # Groq AI caption generator (8 types)
│   ├── generate-image.js     # Pollinations.ai image generator
│   ├── post-to-facebook.js   # Facebook Graph API client
│   └── test-post.js          # Connection tester
├── .github/
│   └── workflows/
│       └── post.yml          # GitHub Actions (8x daily CRON)
├── .env.example              # Environment variables template
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sibby-killer/alfredtechposter.git
cd alfredtechposter
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
FB_PAGE_ID=your_page_id
FB_PAGE_ACCESS_TOKEN=your_page_token
GROQ_API_KEY=your_groq_key
POLLINATIONS_API_KEY=your_pollinations_sk_key
BUSINESS_NAME=Alfred Tech Solutions
BUSINESS_PHONE=+254762667048
BUSINESS_EMAIL=alfred.dev8@gmail.com
```

### 3. Test Connection
```bash
node src/test-post.js
```

### 4. Run a Post Manually
```bash
node src/index.js 1   # Portfolio post
node src/index.js 7   # Problem post (with auto-comment)
```

---

## 🔄 GitHub Actions Setup (Free Automation)

### Add Repository Secrets
Go to: **Settings → Secrets → Actions → New secret**

| Secret | Value |
|--------|-------|
| `FB_PAGE_ID` | Your Facebook Page ID |
| `FB_PAGE_ACCESS_TOKEN` | Your Page Access Token |
| `GROQ_API_KEY` | Your Groq API key |
| `POLLINATIONS_API_KEY` | Your Pollinations sk_ key |

### Activate Workflow
1. Go to **Actions** tab in your repo
2. Click **"Alfred Tech — Facebook Auto Poster"**
3. Click **"Enable workflow"**
4. To test: **"Run workflow"** → choose post number → Run

---

## 🗝️ API Keys & Where to Get Them

| API | URL | Free? |
|-----|-----|-------|
| Facebook Graph API | developers.facebook.com | ✅ Yes |
| Groq API | console.groq.com | ✅ Yes |
| Pollinations.ai | enter.pollinations.ai | ✅ Yes |

---

## 📞 Contact

**Alfred Tech Solutions**  
📞 WhatsApp: +254 762 667 048  
📧 alfred.dev8@gmail.com  
🌐 Alfred Tech Solutions Facebook Page

---

## 📄 License

MIT License — Built with ❤️ by Alfred Tech Solutions
