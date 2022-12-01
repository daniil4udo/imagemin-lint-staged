#!/usr/bin/env node
import { imageminMinify } from '../lib/'

export async function cli(filenames: string[]) {
    return Promise.all(
        filenames.map(async (filename) => {
            console.log(`🚀 Optimizing "${filename}"...\n`)

            const fileSize = await imageminMinify(filename)

            if (fileSize) {
                const { saved, originalSize, optimizedSize } = fileSize

                console.log(
                    saved[0] > 0
                        ? `✅ Saved ${saved[1]} on ${filename} (${originalSize[1]} → ${optimizedSize[1]})\n`
                        : `🤍 ${filename} is already optimized at ${originalSize[1]}\n`,
                )
            }
            else {
                console.log(`🟠 There must be some error optimizing "${filename}"! Skipping...\n`)
            }
        }),
    )
}

cli(process.argv.slice(2))
