import type { ImageminLintStageConfig } from './default-conf';
import type { Plugin as ImageminPlugin } from 'imagemin';

import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { defaultsDeep, getCtor, toLower } from '@democrance/utils';
import { cosmiconfig } from 'cosmiconfig';
import imagemin from 'imagemin';
import prettyBytes from 'pretty-bytes';

import defaultConf from './default-conf';

/**
 * The list of supported image file extensions.
 */
const SUPPORTED_EXTENSIONS = [ '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp' ];

/**
 * The default module name.
 */
const MODULE_NAME = 'imagemin';

/**
 * A function that returns the extension of a file name.
 * @param name - The name of the file.
 * @returns The extension of the file.
 */
const getExtension = (name: string) => toLower(extname(name));

interface Savings {
    originalSize: [ number, string ]
    optimizedSize: [ number, string ]
    saved: [ number, string ]
}

/**
 * A function that calculates the savings after optimizing an image file.
 * @param originalFile - The original image file.
 * @param newFile - The optimized image file.
 * @returns The savings data.
 */
function getSavings(originalFile: Buffer, newFile: Buffer): Savings {
    const originalSize = originalFile.length;
    const optimizedSize = newFile.length;
    const saved = originalSize - optimizedSize;

    return {
        originalSize: [ originalSize, prettyBytes(originalSize) ],
        optimizedSize: [ optimizedSize, prettyBytes(optimizedSize) ],
        saved: [ saved, prettyBytes(saved) ],
    };
}

/**
 *
 * @param {String} plugin - name of the imagemin plugin (without "imagemin-" prefix)
 * @param {Object} config - config for the imagemin-
 */
type ImageminPluginImport = (options?: any) => ImageminPlugin;

/**
 * A function that finds an imagemin plugin.
 * @param plugin - The name of the imagemin plugin.
 * @param config - The configuration for the imagemin plugin.
 * @returns A Promise that resolves to the imagemin plugin or null.
 */
async function findPlugin(plugin: string, config: ImageminLintStageConfig): Promise<ImageminPlugin | null> {
    try {
        if (typeof plugin === 'string' && plugin.startsWith('$_'))
            return Promise.resolve(null);

        const pluginImport: ImageminPluginImport = await import(`imagemin-${plugin}`);

        return (getCtor(pluginImport) as ImageminPluginImport)(config);
    }
    catch {
        console.error(`🔴 Plugin "imagemin-${plugin}" is not installed.\nPlease install it using your package manager.\n`);
        return Promise.resolve(null);
    }
}

/**
 * A function that maps plugins based on configuration.
 * @param configs - The configuration for the imagemin plugins.
 * @returns A Promise that resolves to the list of valid plugins.
 */
function mapPlugin(configs: ImageminLintStageConfig) {
    const plugins = Object
        .entries(configs)
        .reduce((plugins: Promise<ImageminPlugin | null>[], [ pluginName, config ]) => {
            if (config)
                plugins.push(findPlugin(pluginName, config));

            return plugins;
        }, []);

    return Promise.all(plugins).then(res => res.filter(Boolean));
}

/**
 * A function that gets configuration for the imagemin module.
 * @param moduleName - The name of the module (default is 'imagemin').
 * @returns A Promise that resolves to the configuration for the imagemin module.
 */
function getConfig(moduleName = MODULE_NAME): Promise<ImageminLintStageConfig> {
    return cosmiconfig(moduleName)
        .search()
        .then(result => defaultsDeep(defaultConf, result?.config || {}));
}

/**
 * A function that minifies an image file using imagemin.
 * @param filename - The name of the file to be minified.
 * @returns A Promise that resolves to the savings data or null in case of error.
 */
export async function imageminMinify(filename: string) {
    const configs = await getConfig();
    const plugins = await mapPlugin(configs) as ImageminPlugin[];
    const extension = getExtension(filename);

    try {
        if (!SUPPORTED_EXTENSIONS.includes(extension))
            throw new Error(`Invalid extensions "${extension}" found.`);

        const originalFile = await readFile(filename);
        const minifiedFile = await imagemin.buffer(originalFile, { plugins });

        if (minifiedFile.length < originalFile.length)
            await writeFile(filename, minifiedFile);
        else
            console.log(`🟠 Your MINIFIED file is bigger then ORIGINAL "${filename}"\nSkipping... Tweak your configs and try again\n`);

        return getSavings(originalFile, minifiedFile);
    }
    catch (error) {
        console.error('🔴 [filename]: ', filename);
        console.error('🔴 [error]: ', error, '\n');

        if (!configs.$_silentErrors)
            process.exit(1);
        else
            return null;
    }
}
