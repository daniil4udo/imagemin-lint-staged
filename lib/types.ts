import type * as Sharp from 'sharp';
import type { Config as SVGOMinifyOptions } from 'svgo';

export interface Savings {
    originalSize: [ number, string ]
    optimizedSize: [ number, string ]
    saved: [ number, string ]
}

export type SharpMinifyOptions = Sharp.OutputOptions
| Sharp.JpegOptions
| Sharp.PngOptions
| Sharp.WebpOptions
| Sharp.AvifOptions
| Sharp.HeifOptions
| Sharp.JxlOptions
| Sharp.GifOptions
| Sharp.Jp2Options
| Sharp.TiffOptions;

export interface ImageMinifyConfig {
    // https://sharp.pixelplumbing.com/api-output#toformat
    $sharp?: SharpMinifyOptions

    // https://github.com/svg/svgo/tree/main?tab=readme-ov-file#configuration
    $svgo?: SVGOMinifyOptions

    // Plugin Options
    skipDelta?: number
    silentErrors?: boolean
    showSavings?: boolean
}
