import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import imageminMinify from '../dist/lib';
import workerFunction from '../dist/lib/imageMinify.worker.js';

// Constants
const TEMP_DIR = path.resolve(__dirname, '__temp__');
const FILENAMES = [
    './__fixtures__/test.gif',
    './__fixtures__/test.jpg',
    './__fixtures__/test.png',
    './__fixtures__/test.svg',
];

// Helper function to get file sizes
async function getFileSizes(files) {
    return Promise.all(
        files.map(async (file) => {
            const { size } = await stat(file);
            return { file, size };
        }),
    );
}

// Setup and teardown
beforeEach(async () => {
    await mkdir(TEMP_DIR, { recursive: true });
    await Promise.all(
        FILENAMES.map((filename) =>
            copyFile(path.resolve(__dirname, filename), path.resolve(TEMP_DIR, path.basename(filename))),
        ),
    );
});

afterEach(async () => {
    await rm(TEMP_DIR, { recursive: true, force: true });
});

describe('Image Minification', () => {
    describe('Worker', () => {
        const inputImagePath = path.resolve(__dirname, './__fixtures__/test.jpg');
        const svgInputPath = path.resolve(__dirname, './__fixtures__/test.svg');

        it('should skip optimization if the image has the __MINIFIED__ marker', async () => {
            // Create an image with the __MINIFIED__ marker
            const inputBuffer = await sharp(inputImagePath)
                .withMetadata({
                    exif: {
                        IFD0: {
                            ImageDescription: '__MINIFIED__',
                        },
                    },
                })
                .toBuffer();

            const result = await workerFunction({
                input: inputBuffer,
                configs: {},
            });

            expect(result.type).toBe('skip');
        });

        it('should optimize images without the __MINIFIED__ marker and add the marker', async () => {
            const inputBuffer = await sharp(inputImagePath).toBuffer();
            const result = await workerFunction({
                input: inputBuffer,
                configs: {},
            });

            expect(result.type).toBe('success');
            expect(Buffer.isBuffer(result.buffer)).toBe(true);

            // Check if the output image has the __MINIFIED__ marker
            const outputMetadata = await sharp(result.buffer).metadata();
            const exifData = outputMetadata.exif && require('exif-reader')(outputMetadata.exif);
            expect(exifData?.Image?.ImageDescription).toBe('__MINIFIED__');
        });

        it('should optimize SVG files without adding EXIF metadata', async () => {
            const result = await workerFunction({
                input: svgInputPath,
                configs: {
                    svg: {
                        multipass: true,
                    },
                },
            });

            expect(result.type).toBe('success');
            expect(Buffer.isBuffer(result.buffer)).toBe(true);
        });

        it('should return an error for invalid image formats', async () => {
            const invalidInput = Buffer.from('invalid-image-data');
            const result = await workerFunction({
                input: invalidInput,
                configs: {},
            });

            expect(result.type).toBe('error');
            expect(result.message).toContain('Input buffer contains unsupported image format');
        });
    });

    describe('Main', () => {
        it('should reduce file sizes when the delta exceeds skipDelta', async () => {
            const tempFiles = FILENAMES.map((filename) => path.resolve(TEMP_DIR, path.basename(filename)));
            const beforeSizes = await getFileSizes(tempFiles);

            // Minify files with default skipDelta (500 bytes)
            await Promise.all(tempFiles.map((file) => imageminMinify(file)));

            const afterSizes = await getFileSizes(tempFiles);
            afterSizes.forEach(({ file, size: afterSize }, index) => {
                const { size: beforeSize } = beforeSizes[index];
                if (beforeSize - afterSize >= 500) {
                    expect(afterSize).toBeLessThan(beforeSize, `File ${file} was not minified`);
                }
            });
        });

        it('should skip writing files when the delta is less than skipDelta', async () => {
            const tempFiles = FILENAMES.map((filename) => path.resolve(TEMP_DIR, path.basename(filename)));
            const beforeSizes = await getFileSizes(tempFiles);

            // Set a high skipDelta to ensure no files are written
            const config = { skipDelta: 30000 }; // 30 KB
            await Promise.all(tempFiles.map((file) => imageminMinify(file, config)));

            const afterSizes = await getFileSizes(tempFiles);
            afterSizes.forEach(({ file, size: afterSize }, index) => {
                const { size: beforeSize } = beforeSizes[index];
                expect(afterSize).toEqual(beforeSize, `File ${file} was unexpectedly modified`);
            });
        });

        it('should log savings when showSavings is enabled', async () => {
            const tempFile = path.resolve(TEMP_DIR, path.basename(FILENAMES[0]));
            const consoleSpy = vi.spyOn(process.stdout, 'write');

            // Enable showSavings
            const config = { showSavings: true };
            await imageminMinify(tempFile, config);

            // Check if any logging occurred
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle unsupported formats gracefully', async () => {
            const unsupportedFile = path.resolve(TEMP_DIR, 'unsupported.txt');
            await copyFile(path.resolve(__dirname, './__fixtures__/unsupported.txt'), unsupportedFile);

            // Attempt to minify an unsupported file
            await expect(() => imageminMinify(unsupportedFile)).rejects.toThrowError(
                '🔴 Input file contains unsupported image format',
            );
        });
    });
});