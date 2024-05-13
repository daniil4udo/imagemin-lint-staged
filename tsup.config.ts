import { defineConfig } from 'tsup';

export default defineConfig({
    format: [ 'cjs', 'esm' ], // generate cjs and esm files
    entry: [
        'lib/index.ts',
        'bin/cli.ts',
    ],
    // entryPoints: [ 'lib/index.ts' ],
    clean: true, // rimraf dis
    dts: true, // generate dts file for main module
    skipNodeModulesBundle: true,
    splitting: true,
    target: 'node18',
    cjsInterop: true,
});
