const babelParser = require('@babel/eslint-parser');
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const jest = require('eslint-plugin-jest');
const jestDOM = require('eslint-plugin-jest-dom');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '.git/*',
      '.nyc_output/*',
      '.vscode/*',
      '.yarn/*',
      '.yarnrc.yml',
      'coverage/*',
      'dist/*',
      'docs/*',
      'herman/*',
      'node_modules/*',
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,cts,mts}'],
    languageOptions: {
      parser: babelParser,
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    settings: {
      'import/resolver': {
        node: {},
        webpack: {
          config: {
            resolve: {
              modules: ['templates/client', 'scss', 'node_modules'],
              alias: {
                jquery: 'jquery/dist/jquery.slim',
                nunjucks: 'nunjucks/browser/nunjucks-slim',
              },
            },
            resolveLoader: {
              alias: {
                sassjson: 'sass-json-loader',
              },
            },
          },
        },
      },
      'import/external-module-folders': ['node_modules'],
    },
    rules: {
      'no-console': 1,
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', '@@@'] }],
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/order': [
        'warn',
        { 'newlines-between': 'always', alphabetize: { order: 'asc' } },
      ],
      'import/named': 'warn',
    },
  },
  {
    files: ['assets/js/**/*.{js,mjs,cjs,ts,cts,mts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.jquery,
        ...globals.es2021,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/order': 'off',
    },
  },
  {
    files: ['test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.es2021,
      },
    },
    rules: {
      'func-names': 'off',
    },
  },
  {
    files: ['test/clientjs/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
        ...globals.browser,
        ...globals.jquery,
        ...globals.es2021,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      jest,
      'jest-dom': jestDOM,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/order': 'off',
    },
  },
];
