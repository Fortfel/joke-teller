import type { Env } from '#/env'
import type { PinoLoggerOptions } from 'fastify/types/logger'

export const getLoggerConfig = (env: Env['NODE_ENV']): PinoLoggerOptions | false => {
  const envToLogger = {
    development: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    production: {
      level: 'info',
    },
    test: false as const,
  } satisfies Record<typeof env, unknown>

  return envToLogger[env]
}
