require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 3,
  timeout: 60 * 1000 // 60s timeout
});

// 8 content types (added problem_post)
const CONTENT_TYPES = [
  'portfolio_website',
  'tips_tricks',
  'automation_showcase',
  'before_after',
  'pricing_services',
  'social_proof',
  'problem_post',
  'fun_fact'
];

const WEBSITE_NICHES = [
  'Restaurant / Food Business',
  'Real Estate Agency',
  'Salon & Beauty',
  'Church / NGO',
  'E-commerce Shop',
  'Professional Services (Lawyer/Doctor)',
  'School / Academy'
];

const AUTOMATION_NICHES = [
  'WhatsApp Auto-Reply Bot',
  'Social Media Auto-Posting System',
  'Invoice & Report Generator',
  'Lead Collection & Follow-up System',
  'Auto Email Notification System',
  'Google Sheets Data Automation',
  'CRM & Dashboard Automation'
];

// Pain points for problem posts
const PAIN_POINTS = [
  { problem: 'You have a great business but no one finds you online', emoji: '😩', niche: 'any business' },
  { problem: 'Your competitor has a website. You don\'t. They\'re winning.', emoji: '😤', niche: 'local business' },
  { problem: 'Clients can\'t find your contact info after hours', emoji: '😰', niche: 'service business' },
  { problem: 'You\'re losing clients to businesses with professional websites', emoji: '💸', niche: 'any business' },
  { problem: 'Your business looks unprofessional without a website', emoji: '😬', niche: 'startups' },
  { problem: 'You spend hours on WhatsApp answering the same questions', emoji: '😫', niche: 'any business' },
  { problem: 'You\'re doing everything manually — invoices, emails, follow-ups', emoji: '🥵', niche: 'business owner' }
];

const BUSINESS = {
  name: process.env.BUSINESS_NAME || 'Alfred Tech Solutions',
  phone: process.env.BUSINESS_PHONE || '+254 762 667 048',
  email: process.env.BUSINESS_EMAIL || 'alfred.dev8@gmail.com',
  url: process.env.LANDING_PAGE_URL || 'https://alfredtechsolutions.github.io',
  page: 'Alfred Tech Solutions'
};

// Follow CTA to append to every post
const FOLLOW_CTAS = [
  `\n\n👉 Follow @${BUSINESS.page} for daily web & automation tips!`,
  `\n\n📲 Follow our page for more tips that grow your business!`,
  `\n\n💡 Follow Alfred Tech Solutions for daily digital business tips!`,
  `\n\n🔔 Follow our page so you never miss tips like this!`
];

function getTodayRotation() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return {
    contentType: CONTENT_TYPES[dayOfYear % CONTENT_TYPES.length],
    websiteNiche: WEBSITE_NICHES[dayOfYear % WEBSITE_NICHES.length],
    automationNiche: AUTOMATION_NICHES[dayOfYear % AUTOMATION_NICHES.length],
    painPoint: PAIN_POINTS[dayOfYear % PAIN_POINTS.length]
  };
}

function getFollowCTA(dayOfYear) {
  return FOLLOW_CTAS[dayOfYear % FOLLOW_CTAS.length];
}

function getPostPrompt(contentType, websiteNiche, automationNiche, painPoint) {
  const followTag = `\n\n👉 Follow Alfred Tech Solutions for more!\n📞 WhatsApp: ${BUSINESS.phone}`;

  const prompts = {
    portfolio_website: `Write a short, engaging Facebook post for Alfred Tech Solutions showcasing a complete multi-page website we just designed for a ${websiteNiche} client.
- Start with a fire opening line that sounds like a human celebrating a launch
- Mention that this is a full Custom Desktop Website featuring 4 distinct pages (Home, About Us, Services, Contact)
- Say: "Swipe through the carousel to see the full page-by-page breakdown! 👉"
- Use 2-3 emojis naturally
- End with: "DM us or WhatsApp ${BUSINESS.phone} to get your business online today! 🚀"
- Add 4 hashtags
- 120 words MAX. Human, confident tone.`,

    tips_tricks: `Write a Facebook post from Alfred Tech Solutions: "5 Reasons Your ${websiteNiche} Business NEEDS a Website in 2025"
- Numbered list format (1-5)
- Each point: one short sentence with emoji
- End with soft CTA: "Ready to get started? WhatsApp ${BUSINESS.phone}"
- 3 relevant hashtags
- 150 words MAX`,

    automation_showcase: `Write a Facebook post for Alfred Tech Solutions about our ${automationNiche} service.
- Start: "Tired of doing [task] manually? 🤖"  
- 3 bullet points: what it does, who it's for, cost savings
- CTA: "WhatsApp ${BUSINESS.phone} to automate your business today!"
- 3 hashtags
- 150 words MAX`,

    before_after: `Write a Facebook "Before & After" post for Alfred Tech Solutions about a ${websiteNiche} transformation.
- BEFORE: 2 bullet points (losing clients, looking unprofessional)
- AFTER: 2 bullet points (more inquiries, credibility, ranking on Google)
- CTA to WhatsApp ${BUSINESS.phone}
- 3 hashtags. 150 words MAX`,

    pricing_services: `Write a Facebook post for Alfred Tech Solutions promoting our website packages.
💼 Starter: Ksh 19,999 | 📈 Standard: Ksh 39,999 | 🌐 Premium: Ksh 70,000+
🤖 Automation from Ksh 15,000
- Hook: "Your website is your #1 salesperson 💻"
- Mention we build full multi-page experiences, just like the ones shown here.
- List packages with 1-line benefit each
- CTA: "WhatsApp ${BUSINESS.phone} for a FREE quote!"
- 4 hashtags. 150 words MAX`,

    social_proof: `Write a Facebook testimonial post for Alfred Tech Solutions from a happy client.
- Client is a ${websiteNiche} business owner in Kenya
- 3-4 sentences: their problem, what we built, the result (more clients)
- End with CTA to WhatsApp ${BUSINESS.phone}
- Make it feel real and human, not salesy
- 3 hashtags. 150 words MAX`,

    problem_post: `Write a VERY SHORT Facebook post that presents ONE pain point for business owners.
Pain point: "${painPoint.problem}"
Format EXACTLY like this:
[pain point as a question, 1 line]
${painPoint.emoji}
👇 SOLUTION IN COMMENTS 👇

- No more than 3 lines total
- Must make the reader think "this is ME"
- DO NOT give the solution in the post — that goes in comments
- No hashtags in this post`,

    fun_fact: `Write a "Did You Know?" Facebook post from Alfred Tech Solutions about websites/digital business in Kenya/Africa.
- 1 surprising statistic or fact
- Why it matters for business owners
- Soft CTA to check our services
- 4 hashtags. 150 words MAX`
  };

  return (prompts[contentType] || prompts.fun_fact);
}

function getProblemCommentPrompt(painPoint, websiteNiche) {
  return `Write a Facebook COMMENT (not a post) that gives the solution to this problem: "${painPoint.problem}"

Format EXACTLY like this:
✅ Here's how to fix this 👇

1. [Solution point 1 - brief]
2. [Solution point 2 - brief]  
3. [Solution point 3 - brief]
4. A professional website from Alfred Tech Solutions starting at Ksh 19,999

📞 WhatsApp: ${BUSINESS.phone}
🌐 alfred.dev8@gmail.com

💬 Comment "WEBSITE" below and we'll send you our full package details!

Keep it short, punchy — max 120 words. Must feel human, not robotic.`;
}

async function generateCaption(contentType, websiteNiche, automationNiche, postNumber) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const { painPoint } = getTodayRotation();
  const prompt = getPostPrompt(contentType, websiteNiche, automationNiche, painPoint);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a social media manager for Alfred Tech Solutions, a Kenyan web design and automation agency.
Write SHORT, punchy Facebook posts that stop the scroll and drive engagement.
Use natural Kenyan English. Be human, not corporate. Never sound like AI.
Always keep posts under 200 words unless told otherwise.`
      },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.85,
    max_tokens: 400
  });

  let caption = completion.choices[0].message.content;

  // Add follow CTA to all posts except problem_post (that one has "solution in comments" CTA)
  if (contentType !== 'problem_post') {
    caption += getFollowCTA(dayOfYear + postNumber);
  }

  return caption;
}

async function generateProblemComment(websiteNiche) {
  const { painPoint } = getTodayRotation();
  const prompt = getProblemCommentPrompt(painPoint, websiteNiche);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You write short, helpful, human-sounding Facebook comments. Never sound like an AI or robot.'
      },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 300
  });

  return completion.choices[0].message.content;
}

module.exports = { generateCaption, generateProblemComment, getTodayRotation, CONTENT_TYPES };
