import { describe, it, expect, beforeAll } from 'vitest'
import app from '../index.js'

describe('Sessions API', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    const authResponse = await app.request('/api/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test_code' })
    })
    const data = await authResponse.json()
    authToken = data.token
    userId = data.user.id
  })

  describe('POST /api/sessions - Validation', () => {
    it('should return 400 for invalid userId format', async () => {
      const response = await app.request('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId: 'not-a-cuid' })
      })
      expect(response.status).toBe(400)
    })

    it('should return 400 if userId does not match token', async () => {
      const response = await app.request('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId: 'wrong-user-id' })
      })
      expect(response.status).toBe(400)
    })

    it('should create session with valid token', async () => {
      const response = await app.request('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId })
      })
      expect(response.status).toBe(201)
    })
  })

  describe('POST /api/sessions/:id/answers - Validation', () => {
    let sessionId: string

    beforeAll(async () => {
      const createRes = await app.request('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId })
      })
      const { session } = await createRes.json()
      sessionId = session.id
    })

    it('should return 400 for missing questionId', async () => {
      const response = await app.request(`/api/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userAnswer: ['test'] })
      })
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/sessions/:id - Authorization', () => {
    it('should return 401 without token', async () => {
      const response = await app.request('/api/sessions/some-id')
      expect(response.status).toBe(401)
    })

    it.skip('should return session with valid token', async () => {
      const createRes = await app.request('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId })
      })
      const { session } = await createRes.json()

      const response = await app.request(`/api/sessions/${session.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      expect(response.status).toBe(200)
    })
  })
})