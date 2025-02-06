import type * as Sharp from 'sharp';
import type { Config as SVGOMinifyOptions } from 'svgo';

export interface Savings {
    originalSize: [ number, string ]
    optimizedSize: [ number, string ]
    saved: [ number, string ]
}

export type SharpInput =
    | Buffer
    | ArrayBuffer
    | Uint8Array
    | Uint8ClampedArray
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | string;

type FormatOptions = {
    [key in keyof Sharp.FormatEnum]?: any
};

export interface ImageMinifyConfig extends FormatOptions {
    // https://sharp.pixelplumbing.com/api-output#toformat
    // $sharp?: SharpMinifyOptions
    jpeg?: Sharp.JpegOptions
    jp2?: Sharp.Jp2Options
    jxl?: Sharp.JxlOptions
    png?: Sharp.PngOptions
    webp?: Sharp.WebpOptions
    gif?: Sharp.GifOptions
    avif?: Sharp.AvifOptions
    heif?: Sharp.HeifOptions
    tiff?: Sharp.TiffOptions
    raw?: Sharp.RawOptions

    // https://github.com/svg/svgo/tree/main?tab=readme-ov-file#configuration
    svg?: SVGOMinifyOptions

    // Plugin Options
    skipDelta?: number
    silentErrors?: boolean
    showSavings?: boolean
}
