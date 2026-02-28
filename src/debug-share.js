require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state.json');

async function debugShareButton(postId) {
    const parts = postId.split('_');
    const postUrl = `https://www.facebook.com/${parts[0]}/posts/${parts[1]}`;
    console.log(`🔗 Target Post: ${postUrl}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();

    try {
        await page.goto(postUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);

        const dialog = page.getByRole('dialog').first();
        await dialog.hover();

        // Scroll to the bottom of the dialog
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(1000);
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(1000);

        const shareBtn = dialog.locator('div[aria-label="Send this to friends or post it on your profile."]').first();
        await shareBtn.click();
        console.log("Clicked Share Button!");
        await page.waitForTimeout(3000); // wait for menu animation

        // Extract all visible spans/divs with text to see what is actually in that menu!
        const allText = await page.evaluate(() => {
            // Give preference to elements that look like menu items (e.g., deeply nested spans near the end of the body)
            const spans = Array.from(document.querySelectorAll('span'));
            return spans
                .map(s => s.innerText.trim())
                .filter(t => t.toLowerCase().includes('share') || t.toLowerCase().includes('group') || t.length > 5);
        });

        console.log("Found text containing Share or Group on the page:");
        const uniqueText = [...new Set(allText)];
        uniqueText.forEach((t, i) => console.log(`[${i}] "${t}"`));

    } catch (e) {
        console.error(e);
        await page.screenshot({ path: path.join(__dirname, '..', 'debug-error.png') });
    } finally {
        await browser.close();
    }
}

debugShareButton(process.argv[2]);
