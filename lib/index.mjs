import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { cosmiconfig } from 'cosmiconfig'
import merge from 'defu'
import imagemin from 'imagemin'
import prettyBytes from 'pretty-bytes'

import defaultConf from '../lib/default-conf.mjs'

const SUPPORTED_EXTENSIONS = [ '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp' ]
const MODULE_NAME = 'imagemin'

const getExtension = name => path.extname(name).toLowerCase()

/**
 *
 * @param {Buffer} originalFile - Original file Buffer
 * @param {Buffer} newFile - New file Buffer
 * @returns
 */
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

/**
 *
 * @param {Object} comp get default import if passed ES Module
 * @returns
 */
const getCtor = (comp) => {
  if (comp && (comp.__esModule || comp[Symbol.toStringTag] === 'Module'))
    return comp.default

  return comp
}

/**
 *
 * @param {String} plugin - name of the imagemin plugin (without "imagemin-" prefix)
 * @param {Object} config - config for the imagemin-
 * @returns
 */
const findPlugin = async (plugin, config) => {
  try {
    const pluginImport = await import(`imagemin-${plugin}`)
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
 * @returns {Promise}
 */
const mapPlugin = (configs) => {
  const plugins = Object.entries(configs).reduce((plugins, [ pluginName, config ]) => {
    if (typeof config === 'object' && config != null)
      plugins.push(findPlugin(pluginName, config))

    return plugins
  }, [])

  return Promise.all(plugins).then(res => res.filter(Boolean))
}

/**
 *
 * @param {String} moduleName - cosmiconfig configuration name
 * @returns {Object} - extended configs
 */
const getConfig = (moduleName = MODULE_NAME) => {
  return cosmiconfig(moduleName)
    .search()
    .then(result => merge(defaultConf, result?.config || {}))
}

/**
 *
 * @param {String} filename - path to image
 * @returns
 */
export async function minifyFile(filename) {
  const configs = await getConfig()
  const plugins = await mapPlugin(configs)

  try {
    const extension = getExtension(filename)

    if (!SUPPORTED_EXTENSIONS.includes(extension))
      throw new Error(`Invalid extensions "${extension}" found.`)

    const originalFile = await readFile(filename)
    const minifiedFile = await imagemin.buffer(originalFile, { plugins })

    if (minifiedFile.length < originalFile.length)
      await writeFile(filename, minifiedFile)
    else
      console.log(`🟠 Your MINIFIED file is bigger then ORIGINAL "${filename}"\nTweak your configs and try again\n`)

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
