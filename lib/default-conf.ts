import type { Options as ImageminGifsicle } from 'imagemin-gifsicle'
import type { Options as ImageminMozjpeg } from 'imagemin-mozjpeg'
import type { Options as ImageminOptipng } from 'imagemin-optipng'
import type { Options as ImageminSvgo } from 'imagemin-svgo'
import type { Options as ImageminWebp } from 'imagemin-webp'

export interface ImageminLintStageConfig {
    $_silentErrors?: boolean

    gifsicle?: ImageminGifsicle
    mozjpeg?: 'auto' | ImageminMozjpeg
    optipng?: ImageminOptipng
    svgo?: ImageminSvgo
    webp?: ImageminWebp
}

export function defineImageminLintStageConfig(config: ImageminLintStageConfig) {
    return config
}

export default defineImageminLintStageConfig({
    $_silentErrors: true,

    // https://github.com/imagemin/imagemin-gifsicle
    gifsicle: {
        interlaced: true,
    },

    // https://github.com/imagemin/imagemin-mozjpeg
    mozjpeg: 'auto',

    // https://github.com/imagemin/imagemin-optipng
    optipng: {
        optimizationLevel: 4,
    },

    // https://github.com/imagemin/imagemin-svgo
    svgo: {
        plugins: [
            { name: 'removeViewBox', active: false },
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        removeViewBox: false,
                    },
                },
            },
        ],
    },

    // https://github.com/imagemin/imagemin-webp
    webp: {
        quality: 75,
    },
})
