import type { ImageMinifyConfig, Savings } from './types';

import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

import { isNumber } from '@democrance/utils';
import prettyBytes from 'pretty-bytes';
import sharp from 'sharp';
import { optimize as svgOptimize } from 'svgo';

import { DEFAULT_CONFIGS } from './default-conf';

/**
 * A function that returns the extension of a file name.
 * @param name - The name of the file.
 * @returns The extension of the file.
 */

/**
 * A function that calculates the savings after optimizing an image file.
 * @param originalFile - The original image file.
 * @param newFile - The optimized image file.
 * @returns The savings data.
 */
function getSavings(originalFile: Buffer, newFile: Buffer): Savings {
    const originalSize = originalFile.length;
    const optimizedSize = newFile.length;
    const saved = originalSize - optimizedSize;

    return {
        originalSize: [ originalSize, prettyBytes(originalSize) ],
        optimizedSize: [ optimizedSize, prettyBytes(optimizedSize) ],
        saved: [ saved, prettyBytes(saved) ],
    };
}

/**
 * A function that minifies an image file using imagemin.
 * @param filePath - The name of the file to be minified.
 * @returns A Promise that resolves to the savings data or null in case of error.
 */
export async function imageMinify(filePath: string, configs: ImageMinifyConfig = DEFAULT_CONFIGS) {
    try {
        const originalFileBuffer = await readFile(filePath);

        const sharpInstance = sharp(originalFileBuffer);

        let minifiedFileBuffer: Buffer;

        // Let try to get file format first
        const { format } = await sharpInstance.metadata();
        if (!format) {
            return Promise.reject(
                new TypeError(`🔴 [imageMinify]: ${filePath}\n🔴 [error]: Invalid image format`),
            );
        }

        // Use SVGO for SVG files
        if (format === 'svg') {
            // Optimize SVG
            const optimizedSvg = svgOptimize(originalFileBuffer.toString(), configs.$svgo);

            // Create Buffer
            minifiedFileBuffer = Buffer.from(optimizedSvg.data);
        }

        else if (format in sharpInstance) {
            const optimizedImage = sharpInstance.toFormat(format, configs.$sharp);

            // Create Buffer
            minifiedFileBuffer = await optimizedImage.toBuffer();
        }

        else {
            return Promise.reject(
                new TypeError(`🔴 [imageMinify]: ${filePath}\n🔴 [error]: Unsupported image format`),
            );
        }

        // Calculate some savings
        const { saved, originalSize, optimizedSize } = getSavings(originalFileBuffer, minifiedFileBuffer);

        // if Minified file bigger then Original
        const isMinifiedSmaller = minifiedFileBuffer.length > originalFileBuffer.length;
        if (isMinifiedSmaller) {
            process.stdout.write(`🟠 Your MINIFIED file is bigger then ORIGINAL (${originalSize[1]} → ${optimizedSize[1]}) "${filePath}"\nSkipping... Tweak your configs and try again\n`);
            return;
        }
        // if Minified file is less then Original, but difference is less then skipDelta
        const isMinifiedSmallerWithDelta = isNumber(configs.skipDelta) && saved[0] < configs.skipDelta;
        if (isMinifiedSmallerWithDelta) {
            process.stdout.write(`🟠 Your MINIFIED DELTA is smaller then allowed threshold (${originalSize[1]} → ${optimizedSize[1]}) "${filePath}"\nSkipping... Tweak your configs and try again\n`);
            return;
        }

        // Print out savings
        if (configs.showSavings)
            process.stdout.write(`✅ Saved ${saved[1]} on ${filePath} (${originalSize[1]} → ${optimizedSize[1]})\n`);

        return writeFile(filePath, minifiedFileBuffer);
        // await writeFile(`${parse(filePath).dir}/minified.${format}`, minifiedFileBuffer);
    }
    catch (error) {
        process.stdout.write(`🔴 [path]: ${filePath}\n`);
        process.stdout.write(`🔴 [error]: ${error}\n`);

        if (!configs.silentErrors)
            process.exit(1);
        else
            return null;
    }
}
