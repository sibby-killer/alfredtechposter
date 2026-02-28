const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const OUTPUT_DIR = path.join(__dirname, '..', 'generated-images');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const STITCH_API_KEY = process.env.STITCH_API_KEY; // Using the provided key
const STITCH_API_URL = 'https://stitch.googleapis.com/mcp';

function getStitchPrompt(contentType, niche) {
    const base = "Clean, simple, highly professional modern desktop UI design. Use realistic Kenyan/African people in the photography. The currency must be Kenyan Shillings (Ksh) for any pricing. High-end, clean studio quality, perfectly legible text. No generic AI look. CRITICAL INSTRUCTION: Generate ONLY the top hero section (above-the-fold) of the website. DO NOT make a long scrolling page. The screen must exactly fit a standard 1280x1080 desktop viewport so all text remains extremely large, clear, and perfectly readable on social media.";

    if (contentType === 'portfolio_website' || contentType === 'tips_tricks') {
        return `Create a complete 4-page website layout for a premium ${niche} business. Provide 4 distinct screens: Home page, About Us page, Services/Pricing page, and Contact page. ${base}`;
    } else if (contentType === 'pricing_services') {
        return `Create a beautiful pricing page UI for a ${niche} business. Show 3 distinct pricing tiers in Ksh (Starter: Ksh 19k, Standard: Ksh 39k, Premium: Ksh 70k). ${base}`;
    } else if (contentType === 'social_proof') {
        return `Create a testimonial/success story UI page featuring a happy African business owner. Include a 5-star review element and modern clean layout. ${base}`;
    } else if (contentType === 'automation_showcase') {
        return `Create a modern SaaS dashboard UI showing automation analytics and workflow nodes. Clean, simple, and professional tech layout. ${base}`;
    } else if (contentType === 'before_after') {
        return `Create a UI showing a 'Before and After' website transformation for a ${niche} business. Put an old, cluttered layout next to a sleek, modern layout. ${base}`;
    } else if (contentType === 'problem_post') {
        return `Create an elegant, bold social media graphic UI designed for text overlay. Deep rich colors, very clean and professional. ${base}`;
    } else {
        // fun_fact
        return `Create an infographic-style UI page showing digital business statistics for Kenya. Tech aesthetic, clean data visualization. ${base}`;
    }
}

// Generates real UI using Google Stitch MCP API
async function generateStitchImage(prompt, outputPath) {
    console.log(`🎨 Generating real UI with Stitch for: ${prompt.substring(0, 40)}...`);

    // 1. Create Project
    const createProjectRes = await axios.post(STITCH_API_URL, {
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: 'create_project', arguments: { title: `Automation Post ${Date.now()}` } }
    }, { headers: { 'X-Goog-Api-Key': STITCH_API_KEY, 'Content-Type': 'application/json' } });

    if (createProjectRes.data?.result?.isError) {
        throw new Error(`Stitch Project Creation Failed: ${JSON.stringify(createProjectRes.data.result.content)}`);
    }

    const projectData = JSON.parse(createProjectRes.data.result.content[0].text);
    const projectId = projectData.name.split('/')[1];

    // 2. Generate Screen (Takes ~15-60 seconds)
    console.log(`⏳ Waiting for Stitch UI render (~30s)...`);
    const generateRes = await axios.post(STITCH_API_URL, {
        jsonrpc: '2.0', id: 2, method: 'tools/call',
        params: {
            name: 'generate_screen_from_text',
            arguments: { projectId: projectId, prompt: prompt, deviceType: 'DESKTOP' }
        }
    }, { headers: { 'X-Goog-Api-Key': STITCH_API_KEY, 'Content-Type': 'application/json' }, timeout: 180000 });

    const content = generateRes.data.result.content[0].text;
    const parsedData = JSON.parse(content);
    const screens = parsedData.outputComponents?.[0]?.design?.screens;

    if (!screens || screens.length === 0) {
        throw new Error("Stitch returned no screens");
    }

    console.log(`✅ Stitch UI Generated! Found ${screens.length} screens. Downloading...`);

    const savedPaths = [];
    const baseDir = path.dirname(outputPath);
    const baseName = path.basename(outputPath, '.png');

    for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        const screenshotUrl = screen.screenshot.downloadUrl;
        const currentPath = path.join(baseDir, `${baseName}-page${i + 1}.png`);

        console.log(`   Downloading ${i + 1}/${screens.length} to ${path.basename(currentPath)}...`);
        const imageStream = fs.createWriteStream(currentPath);

        await new Promise((resolve, reject) => {
            https.get(screenshotUrl, (response) => {
                response.pipe(imageStream);
                imageStream.on('finish', () => {
                    imageStream.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(currentPath, () => { });
                reject(err);
            });
        });

        savedPaths.push(currentPath);
    }

    console.log(`✅ ${savedPaths.length} Stitch Image(s) saved!`);
    return savedPaths;
}

// Main generation function
async function generateImage(contentType, niche, filename) {
    const outputPath = path.join(OUTPUT_DIR, filename || `${contentType}-${Date.now()}.png`);

    try {
        if (!STITCH_API_KEY) throw new Error("STITCH_API_KEY missing");
        const stitchPrompt = getStitchPrompt(contentType, niche);
        return await generateStitchImage(stitchPrompt, outputPath);
    } catch (error) {
        console.warn(`❌ Image generation failed: ${error.message}`);
        console.warn('   Posting text-only instead.');
        return null;
    }
}

module.exports = { generateImage };
