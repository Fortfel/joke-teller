import { defineConfig } from 'eslint/config'

import { baseConfig } from '@workspace/eslint-config/base'

export default defineConfig(
  {
    ignores: ['create-prod-package.js', 'tsup.config.ts'],
  },
  baseConfig,
)
