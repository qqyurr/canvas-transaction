# Mock API Setup

This directory contains mock API implementations using MSW (Mock Service Worker).

## Structure

- `handlers.ts` - Contains all the mock API endpoint definitions
- `browser.ts` - Setup for client-side mocking in browser environments
- `node.ts` - Setup for server-side mocking in Node.js environments

## Available Mock Endpoints

- `POST https://example.com/login` - User login
- `GET https://example.com/api/users` - Get all users
- `GET https://example.com/api/users/:id` - Get a specific user
- `POST https://example.com/api/users` - Create a new user
- `PUT https://example.com/api/users/:id` - Update an existing user
- `DELETE https://example.com/api/users/:id` - Delete a user

## Setup Instructions

### Browser Setup

To enable browser mocking, add this to your main entry file (e.g., `src/main.ts`):

```typescript
import { worker } from './mocks/browser'

// Start the worker if in development mode
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
  })
}
```

### Node.js Setup

To enable server-side mocking (for SSR or during testing), import the server file:

```typescript
import './mocks/node'
```

## Usage Example

See `src/examples/api-usage.ts` for practical examples of how to use these mock APIs in your application.

## Adding New Mock Endpoints

To add more mock endpoints, edit the `handlers.ts` file and add new handlers to the exported array.

## Disabling Mocks

Simply comment out or remove the initialization code in your entry file to disable the mocks. 