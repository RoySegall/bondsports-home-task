import js from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'drizzle/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      '@stylistic/ts': stylisticTs,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:'],
            ['^@?\\w'],
            ['^@/'],
            ['^\\.'],
            ['^.*\\u0000$'],
          ],
        },
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error',

      /* --- Stylistic Rules (The { foo, bar } format) --- */
      '@stylistic/ts/quotes': ['error', 'single'],
      '@stylistic/ts/semi': ['error', 'always'],
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/object-curly-spacing': ['error', 'always'], // Enforces { foo }
      '@stylistic/ts/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/ts/brace-style': ['error', '1tbs'],
      '@stylistic/ts/type-annotation-spacing': ['error', { before: false, after: true }],
    },
  },
);