import { defineConfig } from 'tsup';

export default defineConfig({
    format: [ 'cjs', 'esm' ], // generate cjs and esm files
    entry: [
        'lib/index.ts',
        'lib/imageMinify.worker.ts',
        'bin/cli.ts',
    ],
    // entryPoints: [ 'lib/index.ts' ],
    clean: true, // rimraf dis
    dts: true, // generate dts file for main module
    skipNodeModulesBundle: true,
    splitting: true,
    cjsInterop: true,
});
