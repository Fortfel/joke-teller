import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import reactPlugin from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

/**
 * A custom ESLint configuration for Vite React applications.
 */
export const viteReactConfig = defineConfig(
  eslintPluginJsxA11y.flatConfigs.recommended,
  ...pluginQuery.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
  pluginReactRefresh.configs.vite,
  pluginReactHooks.configs.flat['recommended-latest'],
  pluginReact.configs.flat.recommended, // This is not a plugin object, but a shareable config object
  pluginReact.configs.flat['jsx-runtime'], // Add this if you are using React 17+
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      // @ts-ignore
      ...reactPlugin.configs.flat['jsx-runtime']?.languageOptions,
      globals: {
        React: 'writable',
      },
    },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
    },
  },
)
