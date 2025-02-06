import type { ImageMinifyConfig, SharpInput } from './types';

import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';

import exif from 'exif-reader';
import sharp from 'sharp';
import { optimize as svgOptimize } from 'svgo';

interface WorkerInput {
    input: SharpInput
    configs: ImageMinifyConfig
}

export default async function ({ input, configs }: WorkerInput) {
    try {
        const sharpInstance = sharp(input);
        const metadata = await sharpInstance.metadata();

        if (!metadata.format) {
            return {
                type: 'error',
                message: `[WebWorker] - Invalid image format for ${input}`,
            };
        }

        let minifiedFileBuffer: Buffer;

        if (metadata.format === 'svg') {
            // Sharp's Buffer throws an error
            // const inputBuffer =  await sharpInstance.toBuffer();
            const inputBuffer = Buffer.isBuffer(input) ? input : await readFile(input as string, 'utf-8');
            // For SVG, we need to get the original content first
            const optimizedSvg = svgOptimize(inputBuffer.toString(), configs.svg);

            minifiedFileBuffer = Buffer.from(optimizedSvg.data);
        }
        else {
            if (metadata.exif) {
                const exifMetadata = exif(metadata.exif);

                // If we already have a marker, skip the image
                if (exifMetadata.Image?.ImageDescription === '__MINIFIED__') {
                    return {
                        type: 'skip',
                    };
                }
            }

            // For non-SVG formats
            const optimizedImage = sharpInstance
                .withMetadata({
                    exif: {
                        IFD0: {
                            // Add a marker to the image to avoid re-optimizing it
                            ImageDescription: '__MINIFIED__',
                        },
                    },
                })
                .toFormat(metadata.format, configs[metadata.format]);

            // For other formats, just optimize without metadata marker
            minifiedFileBuffer = await optimizedImage.toBuffer();
        }

        return {
            type: 'success',
            buffer: minifiedFileBuffer,
        };
    }
    catch (error) {
        return {
            type: 'error',
            message: error instanceof Error ? error.message : error,
        };
    }
}
