#!/usr/bin/env node

import type { ImageMinifyConfig } from '../lib/types';

import { defaultsDeep } from '@democrance/utils';
import { cosmiconfig } from 'cosmiconfig';

import imageMinify from '../lib';
import { DEFAULT_CONFIGS } from '../lib/default-conf';

/**
 * The default module name.
 */
const CONFIG_NAME = 'imagemin';

/**
 * A function that gets configuration for the imagemin module.
 * @param moduleName - The name of the module (default is 'imagemin').
 * @returns A Promise that resolves to the configuration for the imagemin module.
 */
async function getConfig(moduleName = CONFIG_NAME): Promise<ImageMinifyConfig> {
    const result = await cosmiconfig(moduleName).search();
    return defaultsDeep(DEFAULT_CONFIGS, result?.config || {});
}

export async function cli(filenames: string[]) {
    const configs = await getConfig();
    return Promise.all(
        filenames.map(filename => imageMinify(filename, configs)),
    );
}

cli(process.argv.slice(2));
