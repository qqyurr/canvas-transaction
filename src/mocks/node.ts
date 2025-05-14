// src/mocks/node.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Set up MSW server
export const server = setupServer(...handlers)

// Start server when the file is imported
server.listen({ onUnhandledRequest: 'bypass' })

// Clean up
process.on('SIGINT', () => {
  server.close()
  process.exit()
})

process.on('SIGTERM', () => {
  server.close()
  process.exit()
})
