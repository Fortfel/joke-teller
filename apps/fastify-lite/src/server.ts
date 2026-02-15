import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'

import { getLoggerConfig } from '#/config'
import { env } from '#/env'

export function createServer(): {
  server: FastifyInstance
  start: () => Promise<void>
  stop: () => Promise<void>
} {
  // Initialize Fastify
  const server: FastifyInstance = fastify({
    logger: getLoggerConfig(env.NODE_ENV) || true,
  })

  // Security plugins
  server.register(fastifyHelmet)

  server.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86_400,
  })

  server.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  })

  server.register(fastifyCookie)

  // Health check
  server.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    // return reply.redirect(env.PUBLIC_CLIENT_URL)
    return reply.send({ status: 'ok', message: 'API is running!' })
  })

  if (env.PUBLIC_SERVER_API_PATH !== '/') {
    server.get(env.PUBLIC_SERVER_API_PATH + '/', async (_request: FastifyRequest, reply: FastifyReply) => {
      // return reply.redirect(env.PUBLIC_CLIENT_URL)
      return reply.send({ status: 'ok', message: 'API is running!' })
    })
  }

  // Proxy: JokeAPI
  server.get(`${env.PUBLIC_SERVER_API_PATH}/joke`, async (_request: FastifyRequest, reply: FastifyReply) => {
    const response = await fetch(
      'https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit',
    )

    if (!response.ok) {
      return reply.status(response.status).send({ error: 'Failed to fetch joke' })
    }

    const data = await response.json() // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    return reply.send(data)
  })

  // Proxy: VoiceRSS Text-to-Speech
  server.post(
    `${env.PUBLIC_SERVER_API_PATH}/tts`,
    async (request: FastifyRequest<{ Body: { text: string } }>, reply: FastifyReply) => {
      const { text } = request.body

      if (!text || typeof text !== 'string') {
        return reply.status(400).send({ error: 'Missing "text" in request body' })
      }

      const params = new URLSearchParams({
        key: env.VOICE_RSS_API_KEY,
        src: text,
        hl: 'en-us',
        v: 'Linda',
        r: '0',
        c: 'mp3',
        f: '44khz_16bit_stereo',
        b64: 'true',
      })

      const response = await fetch('https://api.voicerss.org/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params.toString(),
      })

      if (!response.ok) {
        return reply.status(response.status).send({ error: 'VoiceRSS API error' })
      }

      const audioData = await response.text()

      if (audioData.startsWith('ERROR')) {
        return reply.status(500).send({ error: audioData })
      }

      return reply.send({ audio: audioData })
    },
  )

  server.setErrorHandler((error, request, reply) => {
    const isProduction = env.NODE_ENV === 'production'

    // Log the full error server-side
    server.log.error(
      {
        err: error,
        url: request.url,
        method: request.method,
      },
      'Unhandled error',
    )

    const statusCode = error instanceof Error && 'statusCode' in error ? Number(error.statusCode) : 500

    // Send sanitized error to client
    if (isProduction) {
      reply.status(statusCode).send({
        error: {
          statusCode,
          message: 'Internal server error',
        },
      })
    } else {
      reply.status(statusCode).send({
        error: {
          statusCode,
          ...(error instanceof Error && error.name ? { name: error.name } : {}),
          ...(error instanceof Error && error.message
            ? { message: error.message }
            : { message: 'Internal server error' }),
          ...(error instanceof Error && error.cause ? { cause: error.cause } : {}),
          ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
        },
      })
    }
  })

  const stop = async (): Promise<void> => {
    await server.close()
  }

  const start = async (): Promise<void> => {
    try {
      const address = await server.listen({ port: env.PUBLIC_SERVER_PORT, host: '127.0.0.1' })

      server.log.info(`Server running at ${address}`)
      server.log.info(`Environment: ${env.NODE_ENV}`)
    } catch (err) {
      server.log.error(err)
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1)
    }
  }

  return { server, start, stop }
}
