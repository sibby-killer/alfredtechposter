const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function upscaleImage(inputPath) {
    try {
        console.log(`🔍 Upscaling image: ${path.basename(inputPath)}...`);
        const outputPath = inputPath.replace('.png', '-upscaled.png');

        // Read metadata to get current dimensions
        const metadata = await sharp(inputPath).metadata();

        // Double the resolution using highest quality Lanczos3 resampling
        await sharp(inputPath)
            .resize({
                width: metadata.width * 2,
                height: metadata.height * 2,
                kernel: sharp.kernel.lanczos3,
                fastShrinkOnLoad: false
            })
            .png({ quality: 100 }) // Ensure max quality PNG output
            .toFile(outputPath);

        console.log(`✨ Upscaling complete! Saved to ${path.basename(outputPath)}`);

        // Optionally, we could overwrite the original or just return the new path
        // For safety, we keep both and return the upscaled path for posting
        return outputPath;
    } catch (error) {
        console.error(`❌ Upscaling failed:`, error.message);
        // Fallback to original image if upscaling fails
        return inputPath;
    }
}

module.exports = { upscaleImage };
