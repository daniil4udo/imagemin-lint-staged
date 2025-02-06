import type { Savings } from './types';
import type { Buffer } from 'node:buffer';

import prettyBytes from 'pretty-bytes';

/**
 * A function that calculates the savings after optimizing an image file.
 * @param originalFile - The original image file.
 * @param newFile - The optimized image file.
 * @returns The savings data.
 */
export function getSavings(originalFile: Buffer, newFile: Buffer): Savings {
    const originalSize = originalFile.length;
    const optimizedSize = newFile.length;
    const saved = originalSize - optimizedSize;

    return {
        originalSize: [ originalSize, prettyBytes(originalSize) ],
        optimizedSize: [ optimizedSize, prettyBytes(optimizedSize) ],
        saved: [ saved, prettyBytes(saved) ],
    };
}
