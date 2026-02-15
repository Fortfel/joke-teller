import { defineConfig } from 'eslint/config'

import { baseConfig } from '@workspace/eslint-config/base'
import { viteReactConfig } from '@workspace/eslint-config/vite-react'

export default defineConfig(
  baseConfig,
  viteReactConfig,

  // Specific override for vite.config.ts to use node config
  {
    files: ['vite.config.ts'],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.node.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
        },
      },
    },
  },
)
