import { defineConfig } from 'tsdown';

export default defineConfig({
    format: [ 'esm' ], // generate cjs and esm files
    entry: [
        'lib/index.ts',
        'lib/imageMinify.worker.ts',
        'bin/cli.ts',
    ],
    // entryPoints: [ 'lib/index.ts' ],
    clean: true, // rimraf dis
    dts: true, // generate dts file for main module
    skipNodeModulesBundle: true,
});
