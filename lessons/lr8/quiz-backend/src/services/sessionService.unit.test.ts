import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SessionService } from './sessionService.js'

vi.mock('@prisma/client', () => {
  const mockTx = {
    session: { findUnique: vi.fn() },
    question: { findUnique: vi.fn() },
    answer: { findUnique: vi.fn(), create: vi.fn() }
  }
  
  return {
    PrismaClient: vi.fn(() => ({
      $transaction: vi.fn(async (callback) => callback(mockTx)),
      session: mockTx.session,
      question: mockTx.question,
      answer: mockTx.answer
    }))
  }
})

// Мокаем scoringService
vi.mock('./scoringService', () => ({
  scoringService: {
    scoreQuestion: vi.fn().mockReturnValue(2)
  }
}))

describe('SessionService', () => {
  let service: SessionService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SessionService()
  })

  describe('submitAnswer', () => {
    it('should throw error if session not found', async () => {
      // Транзакция вернет null для сессии
      await expect(service.submitAnswer({
        sessionId: '123',
        questionId: '456',
        userAnswer: ['a']
      })).rejects.toThrow('Сессия не найдена')
    })
  })

  describe('submitSession', () => {
    it('should throw error if session not found', async () => {
      await expect(service.submitSession('123'))
        .rejects.toThrow('Сессия не найдена')
    })
  })
})