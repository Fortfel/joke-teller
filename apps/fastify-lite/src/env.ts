import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import './load-env'

const baseEnv = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Server
    PUBLIC_SERVER_PORT: z.coerce.number().positive().min(1).max(65_535).default(3000),
    PUBLIC_SERVER_URL: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.hostname,
      error: 'Invalid server URL',
    }),
    PUBLIC_SERVER_API_PATH: z
      .string()
      .startsWith('/', { error: 'API Path must start with "/" if provided.' })
      .refine((val) => val === '/' || !val.endsWith('/'), {
        error: 'API Path must not end with "/" unless it is exactly "/"',
      })
      .default('/api'),

    // Frontend
    PUBLIC_CLIENT_URL: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.hostname,
      error: 'Invalid client URL',
    }),

    // Rate Limiter
    RATE_LIMIT_MAX: z.coerce.number().positive(),
    RATE_LIMIT_WINDOW: z.coerce.number().positive(),

    // VoiceRSS
    VOICE_RSS_API_KEY: z.string().min(1),

    // CORS (comma-separated for multiple origins)
    CORS_ORIGIN: z
      .string()
      .default('')
      .transform((val) => {
        if (!val || val.trim() === '') {
          return []
        }
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) // Remove empty strings
      })
      .pipe(
        z.array(
          z.url({
            protocol: /^https?$/,
            hostname: z.regexes.hostname,
            error: 'Invalid CORS origin',
          }),
        ),
      ),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})

// Post-process to add PUBLIC_CLIENT_URL to CORS_ORIGIN
export const env = {
  ...baseEnv,
  CORS_ORIGIN: ((): Array<string> => {
    const clientUrl = new URL(baseEnv.PUBLIC_CLIENT_URL)

    // First normalize all URLs to origins
    const allOrigins = [...baseEnv.CORS_ORIGIN.map((url) => new URL(url).origin), clientUrl.origin]

    // If in development and CLIENT_URL has a port, add BrowserSync port (+11)
    if (baseEnv.NODE_ENV !== 'production' && clientUrl.port) {
      const browserSyncPort = parseInt(clientUrl.port) + 11
      const browserSyncOrigin = `${clientUrl.protocol}//${clientUrl.hostname}:${browserSyncPort}`
      allOrigins.push(browserSyncOrigin)
    }

    // Then deduplicate
    return [...new Set(allOrigins)]
  })(),
}

export type Env = typeof env
