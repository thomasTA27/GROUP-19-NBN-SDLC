import { onRequest } from 'firebase-functions/v2/https'
import { createApp } from './app'

const app = createApp()

/**
 * Main API Cloud Function — Express fat-lambda pattern.
 * All routes are handled by the Express app.
 *
 * Deployed URL: https://{region}-{project}.cloudfunctions.net/api
 */
export const api = onRequest(
  {
    region: 'australia-southeast1',
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  app
)
