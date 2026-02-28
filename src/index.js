require('dotenv').config();
const { generateCaption, generateProblemComment, getTodayRotation, CONTENT_TYPES } = require('./generate-caption');
const { generateImage } = require('./generate-image');
const { postWithImage, postTextOnly, postComment, testConnection } = require('./post-to-facebook');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

function logPostResult(success, details) {
    const dataPath = path.join(__dirname, '..', 'docs', 'data.json');
    let history = [];
    if (fs.existsSync(dataPath)) {
        try { history = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { }
    }

    history.unshift({
        timestamp: new Date().toISOString(),
        success,
        postNumber: POST_NUMBER,
        ...details
    });

    // Keep last 100 posts to avoid massive files
    if (history.length > 100) history = history.slice(0, 100);

    if (!fs.existsSync(path.dirname(dataPath))) {
        fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(history, null, 2));
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const POST_NUMBER = parseInt(process.env.POST_NUMBER || process.argv[2] || '1', 10);

async function runPost() {
    console.log('\n═══════════════════════════════════════════');
    console.log(`🚀 Alfred Tech Solutions — Auto Poster`);
    console.log(`📅 Post #${POST_NUMBER}`);
    console.log(`⏰ ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} EAT`);
    console.log('═══════════════════════════════════════════\n');

    await testConnection();

    const { websiteNiche, automationNiche } = getTodayRotation();
    const contentType = CONTENT_TYPES[(POST_NUMBER - 1) % CONTENT_TYPES.length];
    const niche = contentType === 'automation_showcase' ? automationNiche : websiteNiche;
    const isProblemPost = contentType === 'problem_post';

    console.log(`📝 Content Type : ${contentType}`);
    console.log(`🏪 Niche        : ${niche}`);
    console.log(`💬 Problem Post : ${isProblemPost ? 'YES — will auto-comment solution' : 'No'}\n`);

    // 1. Generate caption
    console.log('🤖 Generating AI caption...');
    const caption = await generateCaption(contentType, websiteNiche, automationNiche, POST_NUMBER);
    console.log('📄 Caption:\n' + caption.substring(0, 180) + '...\n');

    // 2. Generate image
    const imageFilename = `post-${POST_NUMBER}-${contentType}-${Date.now()}.jpg`;
    const imagePath = await generateImage(contentType, niche, imageFilename);

    // 3. Post to Facebook
    console.log('\n📤 Publishing to Facebook...');
    let postId;
    if (imagePath) {
        postId = await postWithImage(caption, imagePath);
        try { fs.unlinkSync(imagePath); } catch (e) { }
    } else {
        postId = await postTextOnly(caption);
    }

    // 4. Auto-comment solution for problem posts
    if (isProblemPost && postId) {
        console.log('\n💬 Auto-commenting the solution...');
        await sleep(3000); // small delay so post is fully live

        const comment = await generateProblemComment(websiteNiche);
        console.log('Solution comment preview:\n' + comment.substring(0, 150) + '...');

        try {
            await postComment(postId, comment);
            console.log('✅ Auto-comment posted!');
        } catch (err) {
            console.warn('⚠️ Auto-comment failed:', err.message);
            // Don't crash — post is still live
        }
    }
    // Group Forwarding removed per user request

    console.log('\n✅ ALL DONE!');
    console.log(`🔗 Post ID: ${postId}`);
    console.log(`📱 https://facebook.com/${process.env.FB_PAGE_ID}`);
    console.log('═══════════════════════════════════════════\n');

    logPostResult(true, {
        postId,
        contentType,
        niche
    });

    return postId;
}

runPost().catch(err => {
    console.error('❌ FATAL ERROR:', err.message);
    if (err.response?.data) console.error('Details:', JSON.stringify(err.response.data, null, 2));

    logPostResult(false, {
        error: err.message
    });

    process.exit(1);
});
