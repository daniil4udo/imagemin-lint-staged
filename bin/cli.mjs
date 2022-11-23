#!/usr/bin/env node
import { minifyFile } from '../lib/index.mjs'

export async function cli(filenames) {
  return Promise.all(
    filenames.map(async (filename) => {
      console.log(`🚀 Optimizing "${filename}"...\n`)

      const fileSize = await minifyFile(filename)

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

await cli(process.argv.slice(2))
