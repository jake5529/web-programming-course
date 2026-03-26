import { describe, it, expect } from 'vitest'
import { answerSchema, startSessionSchema } from './validation.js'

describe('validation schemas', () => {
  describe('startSessionSchema', () => {
    it('валидный userId', () => {
      const result = startSessionSchema.safeParse({ userId: 'cm6s5jq2k0000abc12345678' })
      expect(result.success).toBe(true)
    })

    it('невалидный userId', () => {
      const result = startSessionSchema.safeParse({ userId: '123' })
      expect(result.success).toBe(false)
    })
  })

  describe('answerSchema', () => {
    it('валидный ответ с массивом', () => {
      const result = answerSchema.safeParse({ 
        questionId: 'cm6s5jq2k0000abc12345678', 
        userAnswer: ['a', 'b'] 
      })
      expect(result.success).toBe(true)
    })

    it('невалидный questionId', () => {
      const result = answerSchema.safeParse({ 
        questionId: '123', 
        userAnswer: ['a'] 
      })
      expect(result.success).toBe(false)
    })
  })
})