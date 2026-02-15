/// <reference types="./types.d.ts" />

import * as path from 'node:path'
import { fixupPluginRules, includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import turboConfig from 'eslint-config-turbo/flat'
import eslintPluginDrizzle from 'eslint-plugin-drizzle'
import importPlugin from 'eslint-plugin-import'
import eslintNeverthrow from 'eslint-plugin-neverthrow'
import eslintPluginTsdoc from 'eslint-plugin-tsdoc'
import turboPlugin from 'eslint-plugin-turbo'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = defineConfig(
  { ignores: ['**/env.ts'] },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: "Use `import { env } from '@/env'` instead to ensure validated types.",
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          name: 'process',
          importNames: ['env'],
          message: "Use `import { env } from '@/env'` instead to ensure validated types.",
        },
      ],
    },
  },
)

/**
 * A shared ESLint configuration for the repository.
 */
export const baseConfig = defineConfig(
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(path.join(import.meta.dirname, '../../.gitignore')),
  { ignores: ['**/*.config.*'] },

  // Base configs for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      turbo: turboPlugin,
    },
    extends: [
      restrictEnvAccess,
      eslint.configs.recommended,
      ...turboConfig,
      eslintConfigPrettier,
      importPlugin.flatConfigs.recommended,
      eslintPluginUnicorn.configs.recommended,
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/core-modules': [],
      'import/ignore': ['node:.*'],
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],

      'import/no-unresolved': [
        'error',
        {
          ignore: ['^node:'],
        },
      ],

      // Unicorn overrides
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/text-encoding-identifier-case': 'off',
    },
  },

  // JavaScript files - NO type-aware rules
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },

  // TypeScript files - WITH type-aware rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      tsdoc: eslintPluginTsdoc,
      drizzle: eslintPluginDrizzle,
      neverthrow: fixupPluginRules(eslintNeverthrow),
    },
    extends: [...tseslint.configs.stylisticTypeChecked, ...tseslint.configs.strictTypeChecked],
    rules: {
      ...eslintPluginDrizzle.configs.recommended.rules,
      'drizzle/enforce-delete-with-where': [
        'error',
        {
          drizzleObjectName: 'db',
        },
      ],
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
          ignore: [
            /^\$/, // Ignore files starting with $ sign
          ],
        },
      ],

      'no-restricted-syntax': [
        'error',
        // Ban all enums:
        {
          selector: 'TSEnumDeclaration',
          message:
            'Use const assertion or a string union type instead. https://mkosir.github.io/typescript-style-guide/#enums--const-assertion',
        },
      ],

      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-misused-promises': [2, { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
          readonly: 'generic',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          // Generic type parameter must start with letter T, followed by any uppercase letter.
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: {
            regex: '^T[A-Z]',
            match: true,
          },
        },
      ],
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'Redirect',
            },
          ],
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignorePrimitives: {
            bigint: false,
            boolean: false,
            number: false,
            string: true,
          },
        },
      ],
      'tsdoc/syntax': 'warn',
      'neverthrow/must-use-result': 'error',
    },
  },

  // TypeScript parser options
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Global linter options
  {
    linterOptions: { reportUnusedDisableDirectives: true },
  },
  {
    // Override for specific files
    // files: ['src/assets/**/*', 'server/**/*'],
    // rules: {
    //   'import/no-default-export': 'off',
    // },
  },
)
