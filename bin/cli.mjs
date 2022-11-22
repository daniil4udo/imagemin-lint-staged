#!/usr/bin/env node
import { minifyFile } from '../lib/index.mjs'

export async function cli(filenames) {
	try {
		return Promise.all(
			filenames.map(async (filename) => {
				console.log(`🛠 >> Optimizing ${filename}...`)

				const { saved, originalSize, optimizedSize } = await minifyFile(filename)

				console.log(
					saved[0] > 0
						? `✅ >> Saved ${saved[1]} on ${filename} (${originalSize[1]} → ${optimizedSize[1]})`
						: `🤍 >> ${filename} is already optimized at ${originalSize[1]}`,
				)
			}),
		)
	}
	catch (error) {
		console.error('🛑 >> ', error)
		process.exit(1)
	}
}

await cli(process.argv.slice(2))
