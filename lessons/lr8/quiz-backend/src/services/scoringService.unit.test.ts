import { describe, it, expect } from 'vitest'
import { scoringService } from './scoringService.js'

describe('scoringService unit tests', () => {
  describe('scoreMultipleSelect', () => {
    it('полный балл за все правильные ответы', () => {
      expect(scoringService.scoreMultipleSelect(['a', 'b'], ['a', 'b'])).toBe(2)
    })

    it('штраф за неправильный ответ', () => {
      expect(scoringService.scoreMultipleSelect(['a', 'b'], ['a', 'c'])).toBe(0.5)
    })

    it('не ниже нуля', () => {
      expect(scoringService.scoreMultipleSelect(['a'], ['b', 'c', 'd'])).toBe(0)
    })

    it('пустые ответы', () => {
      expect(scoringService.scoreMultipleSelect(['a'], [])).toBe(0)
      expect(scoringService.scoreMultipleSelect([], ['a'])).toBe(0)
    })

    it('игнорирует дубликаты', () => {
      expect(scoringService.scoreMultipleSelect(['a', 'b'], ['a', 'a', 'b'])).toBe(2)
    })
  })

  describe('scoreEssay', () => {
    const rubric = {
      maxPoints: 10,
      criteria: [
        { name: 'Content', maxPoints: 5 },
        { name: 'Structure', maxPoints: 3 },
        { name: 'Language', maxPoints: 2 }
      ]
    }

    it('суммирует оценки по критериям', () => {
      expect(scoringService.scoreEssay([4, 2, 1], rubric)).toBe(7)
    })

    it('не превышает максимальный балл', () => {
      expect(scoringService.scoreEssay([5, 3, 2], rubric)).toBe(10)
    })

    it('выбрасывает ошибку при несоответствии количества оценок', () => {
      expect(() => scoringService.scoreEssay([4, 2], rubric)).toThrow(
        'Количество оценок должно соответствовать количеству критериев'
      )
    })

    it('выбрасывает ошибку при превышении максимума критерия', () => {
      expect(() => scoringService.scoreEssay([6, 2, 1], rubric)).toThrow(
        'Оценка по критерию "Content" не может превышать 5'
      )
    })

    it('выбрасывает ошибку при отрицательной оценке', () => {
      expect(() => scoringService.scoreEssay([-1, 2, 1], rubric)).toThrow(
        'Оценка не может быть отрицательной'
      )
    })
  })

  describe('scoreQuestion', () => {
    it('обрабатывает multiple-select вопросы', () => {
      const result = scoringService.scoreQuestion(
        'multiple-select',
        ['a', 'b'],
        ['a', 'c']
      )
      expect(result).toBe(0.5)
    })

    it('обрабатывает essay вопросы с рубрикой', () => {
      const rubric = {
        maxPoints: 10,
        criteria: [
          { name: 'Content', maxPoints: 5 },
          { name: 'Structure', maxPoints: 5 }
        ]
      }
      const result = scoringService.scoreQuestion('essay', null, [4, 3], rubric)
      expect(result).toBe(7)
    })

    it('выбрасывает ошибку для essay без рубрики', () => {
      expect(() => scoringService.scoreQuestion('essay', null, [4, 3]))
        .toThrow('Для essay вопросов необходима рубрика оценивания')
    })

    it('выбрасывает ошибку для неподдерживаемого типа', () => {
      expect(() => scoringService.scoreQuestion('unknown', null, null))
        .toThrow('Неподдерживаемый тип вопроса: unknown')
    })
  })
})