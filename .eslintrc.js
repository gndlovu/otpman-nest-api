module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-console': 'warn',
        // 'comma-dangle': [
        //     'error',
        //     {
        //         'arrays': 'always-multiline',
        //         'objects': 'always-multiline',
        //         'imports': 'always-multiline',
        //         'exports': 'always-multiline',
        //         'functions': 'never',
        //     },
        // ],
        'key-spacing': [
            'error',
            {
                'beforeColon': false,
                'afterColon': true,
                'mode': 'strict',
            },
        ],
        'no-multiple-empty-lines': 'error',
        'no-multi-spaces': 'error',
    },
};
