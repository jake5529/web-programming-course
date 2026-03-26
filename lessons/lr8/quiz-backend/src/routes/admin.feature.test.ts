import { describe, it, expect, beforeAll } from 'vitest'
import app from '../index.js'

describe('Admin API', () => {
  let adminToken: string

  beforeAll(async () => {
    // Получаем токен админа (нужно сделать пользователя админом в БД)
    const authResponse = await app.request('/api/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test_code' })
    })
    const data = await authResponse.json()
    adminToken = data.token
  })

  describe('GET /api/admin/questions', () => {
    it('should return 401 without token', async () => {
      const response = await app.request('/api/admin/questions')
      expect(response.status).toBe(401)
    })

    it('should return questions with valid token', async () => {
      const response = await app.request('/api/admin/questions', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.questions).toBeDefined()
    })
  })

  describe('GET /api/admin/answers/pending', () => {
    it('should return pending answers', async () => {
      const response = await app.request('/api/admin/answers/pending', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      expect(response.status).toBe(200)
    })
  })
})