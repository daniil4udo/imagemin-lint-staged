// imageMinify.ts
import type { ImageMinifyConfig, SharpInput } from './types';
import type { Buffer } from 'node:buffer';

import { readFile, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';

import { isNumber } from '@democrance/utils/isNumber';
import Tinypool from 'tinypool';

import { DEFAULT_CONFIGS } from './default-conf';
import { getSavings } from './getSavings';

const pool = new Tinypool({
    // filename:  URL('./imageMinify.worker.ts', import.meta.url),
    filename: new URL('./lib/imageMinify.worker.js', import.meta.url).href,
    maxThreads: cpus().length - 1,
    idleTimeout: 30000, // 30 seconds
});

export async function imageMinify(input: SharpInput, configs: ImageMinifyConfig = DEFAULT_CONFIGS): Promise<Buffer | undefined> {
    const abortController = new AbortController();

    try {
        const result = await pool.run({ input, configs }, { signal: abortController.signal });

        if (result.type === 'skip')
            return undefined;

        if (result.type === 'error')
            return Promise.reject(new Error(result.message));

        return result.buffer;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${error}`;
        process.stdout.write(`🔴 [imageMinify]: ${errorMessage}\n`);

        return undefined;
    }
}

export default async function (input: SharpInput, configs: ImageMinifyConfig = DEFAULT_CONFIGS): Promise<void> {
    try {
        // Get original buffer for comparison
        const originalFileBuffer = typeof input === 'string'
            ? await readFile(input)
            : input;

        const minifiedFileBuffer = await imageMinify(input, configs);

        if (!minifiedFileBuffer) {
            process.stdout.write(`🟡 Skipping ${typeof input === 'string' ? input : 'buffer'} - already minified\n`);
            return;
        }

        const { saved, originalSize, optimizedSize } = getSavings(
            originalFileBuffer as any,
            minifiedFileBuffer,
        );

        // Skip if minified file is larger
        if (minifiedFileBuffer.length > (originalFileBuffer as any).length) {
            process.stdout.write(
                `🟠 Minified file is larger (${originalSize[1]} → ${optimizedSize[1]}) `
                + `"${typeof input === 'string' ? input : 'buffer'}"\n`
                + `Skipping... Adjust configs and try again\n`,
            );
            return;
        }

        // Skip if delta is below threshold
        if (isNumber(configs.skipDelta) && saved[0] < configs.skipDelta!) {
            process.stdout.write(
                `🟠 Minification delta below threshold (${originalSize[1]} → ${optimizedSize[1]}) `
                + `"${typeof input === 'string' ? input : 'buffer'}"\n`
                + `Skipping... Adjust configs and try again\n`,
            );
            return;
        }

        if (configs.showSavings) {
            process.stdout.write(
                `✅ Saved ${saved[1]} `
                + `${typeof input === 'string' ? `on ${input}` : '(buffer)'} `
                + `(${originalSize[1]} → ${optimizedSize[1]})\n`,
            );
        }

        // Only write file if input was a path
        if (typeof input === 'string') {
            await writeFile(input, minifiedFileBuffer);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : error;
        const identifier = typeof input === 'string' ? input : 'buffer';

        throw new Error(`[image-lint-staged] - ${identifier}\n🔴 ${errorMessage}`);
    }
}

// Cleanup pool when process exits
process.on('exit', () => pool.destroy.bind(pool));
