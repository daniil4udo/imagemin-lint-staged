import type { ImageMinifyConfig } from './types';

export const DEFAULT_CONFIGS: ImageMinifyConfig = {

    // https://github.com/svg/svgo/tree/main?tab=readme-ov-file#configuration
    svg: {
        multipass: true,
    },

    // https://sharp.pixelplumbing.com/api-output#toformat
    jpeg: {
        progressive: true,
    },
    png: {
        effort: 6,
        compressionLevel: 9,
    },
    webp: {
        nearLossless: true,
        effort: 6,
    },
    gif: {
        effort: 6,
    },

    // Library defaults
    skipDelta: 500,
    silentErrors: false,
    showSavings: true,
};

// Function to create a configuration object for the image minification process
export function defineImageLintStageConfig<T extends Partial<ImageMinifyConfig>>(config: T) {
    return config;
}
