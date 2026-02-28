const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); // Just in case, but we might not need this for a simple GET
const https = require('https');

// This script simulates what we'll do in index.js to get a real UI screenshot
// Wait, we can't use the Native MCP Tool directly from Node without setting up an MCP Client.
// BUT we CAN use the HTTP API we discovered earlier if we pass the right payload!

const API_KEY = 'AQ.Ab8RN6IIAyzTLSMaDPqE9BaBOT5sjFHXGaGouLdU9D2H2kYnbQ';
const API_URL = 'https://stitch.googleapis.com/mcp';

async function generateStitchUI(prompt) {
    try {
        console.log("🛠️ Calling Stitch MCP via HTTP...");

        // We discovered the exact payload: 
        // method: generate_screen_from_text
        // args: projectId, prompt
        // Wait, the MCP output earlier showed we need a specific format. Let's try to mimic the native MCP call.

        // The native MCP call just accepts projectId and prompt.
        // Let's create a project first via the HTTP API to be safe
        const createProjectRes = await axios.post(API_URL, {
            jsonrpc: '2.0', id: 1, method: 'tools/call',
            params: { name: 'create_project', arguments: { title: `Automation Post ${Date.now()}` } }
        }, { headers: { 'X-Goog-Api-Key': API_KEY, 'Content-Type': 'application/json' } });

        if (createProjectRes.data?.result?.isError) {
            console.log('Error creating project:', JSON.stringify(createProjectRes.data.result.content));
            return;
        }

        const projectData = JSON.parse(createProjectRes.data.result.content[0].text);
        // Project ID format: "projects/1234..." -> "1234..."
        const projectId = projectData.name.split('/')[1];
        console.log(`✅ Created Project: ${projectId}`);

        // Now generate the screen
        console.log("\n🎨 Generating UI Screen (this takes ~15 seconds)...");
        const generateRes = await axios.post(API_URL, {
            jsonrpc: '2.0', id: 2, method: 'tools/call',
            params: {
                name: 'generate_screen_from_text',
                arguments: { projectId: projectId, prompt: prompt, deviceType: 'DESKTOP' }
            }
        }, { headers: { 'X-Goog-Api-Key': API_KEY, 'Content-Type': 'application/json' }, timeout: 180000 });

        const content = generateRes.data.result.content[0].text;
        const parsedData = JSON.parse(content);

        // Output components contains the design details
        const screens = parsedData.outputComponents?.[0]?.design?.screens;
        if (!screens || screens.length === 0) {
            throw new Error("No screens returned");
        }

        // Grab all variants/screens returned
        console.log(`✅ UI Generated! Found ${screens.length} screens. Downloading...`);

        // Download all images
        for (let i = 0; i < screens.length; i++) {
            const screen = screens[i];
            const screenshotUrl = screen.screenshot.downloadUrl;
            // The prompt might influence the title, but let's use the title or index
            const safeTitle = (screen.title || `page-${i}`).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `stitch-ui-${safeTitle}-${i + 1}.png`;

            console.log(`\n📥 Downloading image ${i + 1}/${screens.length} to ${filename}...`);
            const imageStream = fs.createWriteStream(filename);

            await new Promise((resolve, reject) => {
                https.get(screenshotUrl, (response) => {
                    response.pipe(imageStream);
                    imageStream.on('finish', () => {
                        imageStream.close();
                        console.log(`✅ Downloaded: ${filename}`);
                        resolve();
                    });
                }).on('error', (err) => {
                    fs.unlink(filename, () => { });
                    console.error(`❌ Download error for ${filename}:`, err.message);
                    reject(err);
                });
            });
        }

    } catch (error) {
        console.error("❌ Stitch UI Generation Failed:");
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

generateStitchUI("Create a complete 4-page website layout for a luxury modern real estate business. Provide 4 distinct screens: Home page, About Us page, Properties Grid page, and Contact page. All screens must be in desktop form factor, highly detailed, professional UI design. Dark mode.");
