'use strict'

module.exports = {
    // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
    // This option interrupts the configuration hierarchy at this file
    // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
    root: true,

    globals: {
        // ga: true, // Google Analytics
        // google: true, // Google Maps
        process: true,
    },

    extends: [
        '@antfu',

        // Import
        // https://github.com/benmosher/eslint-plugin-import
        'plugin:import/errors',
        'plugin:import/warnings',

        // 'plugin:putout/recommended',
    ],

    plugins: [
        'import',
        'unused-imports',
        // 'putout',
    ],

    rules: {
        // Only allow debugger in development
        'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',

        // Only allow `console.log` in development
        'no-console': process.env.PRE_COMMIT ? ['error', { allow: ['warn', 'error'] }] : 'off',

        // 🛑 OFF RULES
        'no-tabs': 'off',

        // 🛠 RULES

        'array-bracket-spacing': [
            'error',
            'always',
            {
                objectsInArrays: false,
            },
        ],
        'eol-last': [
            'error',
            'always',
        ],
        'newline-per-chained-call': [
            'error',
            {
                ignoreChainWithDepth: 3,
            },
        ],
        'no-useless-concat': 'error',
        'prefer-destructuring': [
            'warn',
            {
                array: false,
                object: true,
            },
        ],
        'quotes': [
            'error',
            'single',
            {
                allowTemplateLiterals: true,
            },
        ],

        // Indent configuration
        'indent': [
            'off',
            4,
            {
                SwitchCase: 1,
                VariableDeclarator: 1,
                outerIIFEBody: 1,
                flatTernaryExpressions: false,
                offsetTernaryExpressions: false,
                ignoreComments: false,
            },
        ],

        // Import
        'unused-imports/no-unused-imports': 'error',
        'import/no-duplicates': 'error',
        'import/namespace': [
            'error',
            {
                allowComputed: true,
            },
        ],
        'import/order': [
            'error',
            {
                'groups': [
                    'type',
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'unknown',
                ],
                'newlines-between': 'always',
                'alphabetize': {
                    order: 'asc',
                },
                'pathGroups': [{
                    pattern: '@/**',
                    group: 'internal',
                    position: 'after',
                }],
            },
        ],
    },
}

