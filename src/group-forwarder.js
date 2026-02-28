require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');

// List the exact names of the Facebook groups you want to share to.
const TARGET_GROUPS = [
    "Kenya Business Network", // Update with real names you have joined
    "Nairobi Entrepreneurs",
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createSession() {
    console.log("🛠️ Starting setup to save Facebook login session...");
    console.log("⚠️ A visible browser will open. Please log into Facebook MANUALLY.");
    console.log("👉 When you are fully logged in and see your feed: PRESS CTRL+C IN THIS TERMINAL to safely save your session.");

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.facebook.com/');

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question('\n✅ Press ENTER exactly here in this terminal when you are fully logged in...', async () => {
            console.log("\n✅ Saving session state...");
            try {
                await context.storageState({ path: STATE_FILE });
                console.log("💾 Session saved to state.json! Keep this file secret.");
            } catch (err) {
                console.error("❌ Failed to save session:", err.message);
            }
            await browser.close();
            readline.close();
            resolve();
        });
    });
}

async function forwardToGroups(postId) {
    if (!fs.existsSync(STATE_FILE)) {
        console.error("❌ No state.json found. You must run `node src/group-forwarder.js login` first to log in.");
        process.exit(1);
    }

    // Split ID like "976168628917190_122095580775259556"
    const parts = postId.split('_');
    const postUrl = `https://www.facebook.com/${parts[0]}/posts/${parts[1]}`;

    console.log(`\n🤖 Starting Group Forwarder Headless Bot...`);
    console.log(`🔗 Target Post: ${postUrl}`);

    const browser = await chromium.launch({ headless: true }); // Change headless: false for debugging
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();

    try {
        await page.goto(postUrl, { waitUntil: 'networkidle' });
        await sleep(5000);

        // Make sure it's the actual post page
        const isLogin = await page.getByTestId('royal_login_button').count();
        if (isLogin > 0) {
            throw new Error("Session expired! Please run login flow again.");
        }

        console.log("✅ Successfully loaded the post page.");

        // Find the Dialog/Modal that contains the post
        console.log("🔄 Looking for the 'Share' button in the post dialog...");
        const dialog = page.getByRole('dialog').first();

        // Scroll down within the dialog to ensure the Share button is visible
        await dialog.hover();
        await page.mouse.wheel(0, 1000); // Scroll down
        await sleep(2000);

        // We use the exact ARIA label discovered via the debug script
        console.log("🔄 Attempting to click the Share action...");
        const shareBtn = dialog.locator('div[aria-label="Send this to friends or post it on your profile."], div[aria-label="Send this to friends or post it on your timeline."], div[role="button"]:has-text("Share")').first();

        try {
            await shareBtn.waitFor({ state: 'visible', timeout: 5000 });
            await shareBtn.click();
        } catch (e) {
            console.log("⚠️ Precise locators failed. Falling back to structural (4th action button)...");
            // Find all buttons with tabindex=0 inside the dialog that might be the action row
            const buttons = dialog.locator('div[role="button"][tabindex="0"]');

            // Like (0), React (1), Comment (2), Share (3)
            const fallbackBtn = buttons.filter({ has: page.locator('svg') }).nth(3);
            await fallbackBtn.click();
        }

        await sleep(2000);

        // Click "Share to a group" -> Facebook recently changed this text to just "Group"
        console.log("🔄 Clicking 'Group' option in share menu...");
        const shareToGroupBtn = page.getByText(/^Group$/, { exact: true }).last();

        try {
            await shareToGroupBtn.waitFor({ state: 'attached', timeout: 5000 });
            await shareToGroupBtn.click({ force: true });
        } catch (e) {
            console.log("⚠️ Text locator failed, trying alternative alternative...");
            const fallbackGrp = page.locator('span:text-is("Group")').last();
            await fallbackGrp.click({ force: true });
        }

        await sleep(4000);

        for (let i = 0; i < TARGET_GROUPS.length; i++) {
            const groupName = TARGET_GROUPS[i];
            console.log(`\n🎯 Attempting to share to: "${groupName}"`);

            // Search for the group
            const searchInput = page.getByPlaceholder(/Search for groups/i);
            await searchInput.fill('');
            await sleep(1000);
            await searchInput.fill(groupName);
            await sleep(3000);

            // Click the matching group in the list
            const groupItem = page.getByRole('button', { name: new RegExp(groupName, 'i') }).first();
            try {
                await groupItem.waitFor({ state: 'visible', timeout: 5000 });
                await groupItem.click();
                console.log(`✅ Selected group: ${groupName}`);
            } catch (err) {
                console.log(`⚠️ Could not find group "${groupName}". Make sure you joined it.`);
                continue;
            }

            await sleep(3000);

            // Click Post
            console.log(`🔄 Clicking Post...`);
            const postBtn = page.getByRole('button', { name: /^Post$/i }).first();
            await postBtn.click();

            console.log(`✅ Shared to ${groupName}!`);

            // Wait a random human-like delay before sharing the next one to avoid spam filters
            if (i < TARGET_GROUPS.length - 1) {
                console.log(`⏳ Waiting 15 seconds before sharing to the next group... (Testing Delay)`);
                await sleep(15000);

                // Re-open share menu for the next loop
                console.log("🔄 Re-opening Share menu...");
                await shareBtn.click();
                await sleep(2000);
                await shareToGroupBtn.click();
                await sleep(4000);
            }
        }

        console.log(`\n🎉 All group forwarding completed successfully!`);

    } catch (error) {
        console.error("❌ Forwarding failed:", error.message);
        // Take a screenshot of the error state to help debug
        await page.screenshot({ path: path.join(__dirname, '..', 'playwright-error.png') });
        console.log("📸 Saved a screenshot of what went wrong to 'playwright-error.png'.");
    } finally {
        await browser.close();
    }
}

// Simple CLI router
const command = process.argv[2];
const arg2 = process.argv[3];

if (command === 'login') {
    createSession();
} else if (command === 'share' && arg2) {
    forwardToGroups(arg2);
} else {
    console.log("Usage:");
    console.log("  node src/group-forwarder.js login           --> Run first to save your Facebook login.");
    console.log("  node src/group-forwarder.js share <POST_ID> --> Automates sharing a post ID to your groups.");
}

module.exports = { forwardToGroups };
