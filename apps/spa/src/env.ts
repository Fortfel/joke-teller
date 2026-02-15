import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'PUBLIC_',

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client.
   */
  client: {
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
    PUBLIC_BASE_PATH: z
      .string()
      .startsWith('/', { error: 'Base Path must start with "/" if provided.' })
      .endsWith('/', { error: 'Base Path must end with "/" if provided.' })
      .default('/'),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

  skipValidation: import.meta.env.MODE === 'test',

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

export type Env = typeof env
