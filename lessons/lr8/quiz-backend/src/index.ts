import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import auth from './routes/auth.js'
import sessions from './routes/session.js'
import admin from './routes/admin.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => c.json({ message: 'Quiz API' }))

app.route('/api/auth', auth)
app.route('/api/sessions', sessions)
app.route('/api/admin', admin)

// Запускаем сервер только если не в тестовом режиме
if (process.env.NODE_ENV !== 'test') {
  const { serve } = await import('@hono/node-server')
  serve({
    fetch: app.fetch,
    port: 3000
  })
  console.log('Server running on http://localhost:3000')
}

export default app