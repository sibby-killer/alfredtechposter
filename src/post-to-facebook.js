require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PAGE_ID = process.env.FB_PAGE_ID;
const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const API_VERSION = 'v22.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

async function postTextOnly(message) {
    console.log('📤 Posting text to Facebook...');
    const response = await axios.post(`${BASE_URL}/${PAGE_ID}/feed`, {
        message,
        access_token: ACCESS_TOKEN
    });
    console.log(`✅ Text post published! ID: ${response.data.id}`);
    return response.data.id;
}

async function postWithImage(message, imagePaths) {
    if (!Array.isArray(imagePaths)) {
        imagePaths = [imagePaths];
    }

    if (imagePaths.length === 1) {
        console.log('📤 Uploading single photo to Facebook...');
        const form = new FormData();
        form.append('source', fs.createReadStream(imagePaths[0]));
        form.append('message', message);
        form.append('access_token', ACCESS_TOKEN);

        const response = await axios.post(
            `${BASE_URL}/${PAGE_ID}/photos`,
            form,
            { headers: form.getHeaders() }
        );
        const postId = response.data.post_id || response.data.id;
        console.log(`✅ Photo post published! ID: ${postId}`);
        return postId;
    }

    // MULTIPLE IMAGES (Carousel)
    console.log(`📤 Uploading ${imagePaths.length} photos for a carousel post...`);
    const mediaIds = [];

    for (let i = 0; i < imagePaths.length; i++) {
        const imgPath = imagePaths[i];
        if (!fs.existsSync(imgPath)) continue;

        console.log(`   Uploading image ${i + 1}/${imagePaths.length}...`);
        const form = new FormData();
        form.append('source', fs.createReadStream(imgPath));
        form.append('published', 'false'); // Do not publish immediately
        form.append('access_token', ACCESS_TOKEN);

        const uploadRes = await axios.post(
            `${BASE_URL}/${PAGE_ID}/photos`,
            form,
            { headers: form.getHeaders() }
        );

        if (uploadRes.data.id) {
            mediaIds.push({ media_fbid: uploadRes.data.id });
        }
    }

    console.log(`📤 Publishing carousel post to feed...`);
    const feedResponse = await axios.post(`${BASE_URL}/${PAGE_ID}/feed`, {
        message: message,
        attached_media: mediaIds,
        access_token: ACCESS_TOKEN
    });

    console.log(`✅ Multi-photo post published! ID: ${feedResponse.data.id}`);
    return feedResponse.data.id;
}

// Auto-comment on a post (for problem posts — solution goes in comments)
async function postComment(postId, message) {
    console.log('💬 Posting auto-comment...');
    // postId from /photos is in format pageId_photoId, use it directly
    const response = await axios.post(
        `${BASE_URL}/${postId}/comments`,
        {
            message,
            access_token: ACCESS_TOKEN
        }
    );
    console.log(`✅ Comment posted! ID: ${response.data.id}`);
    return response.data.id;
}

async function testConnection() {
    console.log('🔌 Testing Facebook API connection...');
    const response = await axios.get(`${BASE_URL}/${PAGE_ID}`, {
        params: {
            fields: 'name,fan_count,followers_count',
            access_token: ACCESS_TOKEN
        }
    });
    console.log(`✅ Connected: ${response.data.name} | Followers: ${response.data.followers_count || 0}`);
    return response.data;
}

module.exports = { postTextOnly, postWithImage, postComment, testConnection };
