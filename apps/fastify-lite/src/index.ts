import { createServer } from '#/server'

const server = createServer()

void server.start()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server
    .stop()
    .then(() => {
      console.log('Server stopped successfully')
      process.exit(0)
    })
    .catch((error: unknown) => {
      console.error('Error during shutdown:', error)
      process.exit(1)
    })
})
// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server
    .stop()
    .then(() => {
      console.log('Server stopped successfully')
      process.exit(0)
    })
    .catch((error: unknown) => {
      console.error('Error during shutdown:', error)
      process.exit(1)
    })
})
