require('dotenv').config();
const { testConnection } = require('./post-to-facebook');
const { postTextOnly } = require('./post-to-facebook');

async function testFacebook() {
    console.log('🧪 Testing Facebook API Connection...\n');
    try {
        const page = await testConnection();
        console.log('\n✅ Connection successful!');
        console.log('Page details:', page);

        // Try a real test post
        const testMessage = `🧪 Test post from Alfred Tech Solutions automation system.

This post was automatically generated and posted via the Facebook Graph API.

📞 Contact us: +254 762 667 048
🌐 Alfred Tech Solutions | Web Design & Automation`;

        console.log('\n📤 Sending test post...');
        const postId = await postTextOnly(testMessage);
        console.log(`\n✅ Test post live! Post ID: ${postId}`);
        console.log(`🔗 https://facebook.com/${process.env.FB_PAGE_ID}`);
    } catch (err) {
        console.error('❌ Test failed:', err.message);
        if (err.response?.data) {
            console.error('API Response:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

testFacebook();
