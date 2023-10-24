import type { ImageMinifyConfig } from './types';

export const DEFAULT_CONFIGS: ImageMinifyConfig = {
    // sharp
    $sharp: {
        progressive: true,
        quality: 90,
        nearLossless: true,
        effort: 6,
        compressionLevel: 9,
        force: false,
    },

    // svgo
    $svgo: {
        multipass: true,
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
