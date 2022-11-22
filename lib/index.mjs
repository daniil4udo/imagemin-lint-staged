import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { cosmiconfig } from 'cosmiconfig'
import merge from 'defu'
import imagemin from 'imagemin'
import prettyBytes from 'pretty-bytes'

import defaultConf from '../lib/default-conf.mjs'

const SUPPORTED_EXTENSIONS = [ '.jpg', '.jpeg', '.png', '.gif', '.svg' ]
const MODULE_NAME = 'imagemin'

const explorer = cosmiconfig(MODULE_NAME)

const getExtension = name => path.extname(name).toLowerCase()

const getSavings = (originalFile, newFile) => {
	const originalSize = originalFile.length
	const optimizedSize = newFile.length
	const saved = originalSize - optimizedSize

	return {
		originalSize: [ originalSize, prettyBytes(originalSize) ],
		optimizedSize: [ optimizedSize, prettyBytes(optimizedSize) ],
		saved: [ saved, prettyBytes(saved) ],
	}
}

const getCtor = (comp) => {
	if (comp && (comp.__esModule || comp[Symbol.toStringTag] === 'Module'))
		return comp.default

	return comp
}

const findPlugin = async (plugin, config) => {
	try {
		const pluginImport = await import(`imagemin-${plugin}`)
		return getCtor(pluginImport)(config)
	}
	catch {
		return null
	}
}

const mapPlugin = async (configs) => {
	const plugins = []

	for (const [ pluginName, config ] of Object.entries(configs)) {
		if (typeof config === 'object' && config !== null) {
			const plugin = await findPlugin(pluginName, config)
			if (plugin)
				plugins.push(plugin)
		}
	}

	return plugins
}

export async function minifyFile(filename) {
	const result = await explorer.search()
	const configs = merge(defaultConf, result?.config || {})
	const plugins = await mapPlugin(configs)

	try {
		const extension = getExtension(filename)

		if (!SUPPORTED_EXTENSIONS.includes(extension))
			throw new Error(`Invalid extensions "${extension}" found.`)

		const originalFile = await readFile(filename)
		const minifiedFile = await imagemin.buffer(originalFile, { plugins })

		await writeFile(filename, minifiedFile)

		return getSavings(originalFile, minifiedFile)
	}
	catch (error) {
		console.error('🛑 [filename]: ', filename)
		console.error('🛑 [error]: ', error)

		if (!configs.$silentErrors)
			process.exit(1)
		else return null
	}
}
