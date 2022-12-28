import type { ImageminLintStageConfig } from './default-conf'
import type { Plugin as ImageminPlugin } from 'imagemin'

import { readFile, writeFile } from 'node:fs/promises'
import { extname } from 'node:path'

import { getCtor, defaultsDeep } from '@democrance/utils'
import { cosmiconfig } from 'cosmiconfig'
import imagemin from 'imagemin'
import prettyBytes from 'pretty-bytes'

import defaultConf from './default-conf'

const SUPPORTED_EXTENSIONS = [ '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp' ]
const MODULE_NAME = 'imagemin'

const getExtension = (name: string) => extname(name).toLowerCase()

/**
 *
 * @param {Buffer} originalFile - Original file Buffer
 * @param {Buffer} newFile - New file Buffer
 */
interface Savings {
    originalSize: [ number, string ]
    optimizedSize: [ number, string ]
    saved: [ number, string ]
}
const getSavings = (originalFile: Buffer, newFile: Buffer): Savings => {
    const originalSize = originalFile.length
    const optimizedSize = newFile.length
    const saved = originalSize - optimizedSize

    return {
        originalSize: [ originalSize, prettyBytes(originalSize) ],
        optimizedSize: [ optimizedSize, prettyBytes(optimizedSize) ],
        saved: [ saved, prettyBytes(saved) ],
    }
}

/**
 *
 * @param {String} plugin - name of the imagemin plugin (without "imagemin-" prefix)
 * @param {Object} config - config for the imagemin-
 */
type ImageminPluginImport = (options?: any) => ImageminPlugin
const findPlugin = async (plugin: string, config: ImageminLintStageConfig): Promise<ImageminPlugin | null> => {
    try {
        if (typeof plugin === 'string' && plugin.startsWith('$_'))
            return Promise.resolve(null)

        const pluginImport: ImageminPluginImport = await import(`imagemin-${plugin}`)
        return getCtor(pluginImport)(config)
    }
    catch {
        console.error(`🔴 Plugin "imagemin-${plugin}" is not installed.\nPlease install it using your package manager.\n`)
        return Promise.resolve(null)
    }
}

/**
 *
 * @param {Object} configs - resolved configs from the cosmiconfig
 */
const mapPlugin = (configs: ImageminLintStageConfig) => {
    const plugins = Object
        .entries(configs)
        .reduce((plugins: Promise<ImageminPlugin | null>[], [ pluginName, config ]) => {
            if (config)
                plugins.push(findPlugin(pluginName, config))

            return plugins
        }, [])

    return Promise.all(plugins).then(res => res.filter(Boolean))
}

/**
 *
 * @param {String} moduleName - cosmiconfig configuration name
 */
const getConfig = (moduleName = MODULE_NAME): Promise<ImageminLintStageConfig> => {
    return cosmiconfig(moduleName)
        .search()
        .then(result => defaultsDeep(defaultConf, result?.config || {}))
}

/**
 *
 * @param {String} filename - path to image
 */
export async function imageminMinify(filename: string) {
    const configs = await getConfig()
    const plugins = await mapPlugin(configs) as ImageminPlugin[]
    const extension = getExtension(filename)

    try {
        if (!SUPPORTED_EXTENSIONS.includes(extension))
            throw new Error(`Invalid extensions "${extension}" found.`)

        const originalFile = await readFile(filename)
        const minifiedFile = await imagemin.buffer(originalFile, { plugins })

        if (minifiedFile.length < originalFile.length)
            await writeFile(filename, minifiedFile)
        else
            console.log(`🟠 Your MINIFIED file is bigger then ORIGINAL "${filename}"\nSkipping... Tweak your configs and try again\n`)

        return getSavings(originalFile, minifiedFile)
    }
    catch (error) {
        console.error('🔴 [filename]: ', filename)
        console.error('🔴 [error]: ', error, '\n')

        if (!configs.$_silentErrors)
            process.exit(1)
        else
            return null
    }
}
