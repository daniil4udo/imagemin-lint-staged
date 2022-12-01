import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    name: 'imagemin-lint-staged',
    entries: [
        './bin/cli',
    ],
    declaration: true,
    rollup: {
        emitCJS: true,
    },
})
