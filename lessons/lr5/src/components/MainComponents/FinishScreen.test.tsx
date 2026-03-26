import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinishComponent } from './FinishScreen';

describe('FinishComponent', () => {
  const mockQuestions = [
    { 
      id: '1', 
      question: 'Вопрос 1', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: 0,
      difficulty: 'easy' as const,
      type: 'multiple' as const
    },
    { 
      id: '2', 
      question: 'Вопрос 2', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: 1,
      difficulty: 'medium' as const,
      type: 'multiple' as const
    },
    { 
      id: '3', 
      question: 'Вопрос 3', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: 2,
      difficulty: 'hard' as const,
      type: 'multiple' as const
    },
    { 
      id: '4', 
      question: 'Вопрос 4', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: 3,
      difficulty: 'easy' as const,
      type: 'multiple' as const
    },
    { 
      id: '5', 
      question: 'Вопрос 5', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: 0,
      difficulty: 'medium' as const,
      type: 'multiple' as const
    },
  ];

  it('renders score and percentage', () => {
    render(
      <FinishComponent
        theme="light"
        score={400}
        correctAnswersCount={4}
        questions={mockQuestions}
        resetGame={vi.fn()}
      />
    );

    expect(screen.getByText('Игра завершена!')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText(/4\s*из\s*5/)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('calls resetGame when restart button clicked', () => {
    const mockReset = vi.fn();

    render(
      <FinishComponent
        theme="light"
        score={400}
        correctAnswersCount={4}
        questions={mockQuestions}
        resetGame={mockReset}
      />
    );

    fireEvent.click(screen.getByText('Играть снова'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  describe('emoji and percentage calculation', () => {
    it('shows 🏆 and 100% when all answers correct', () => {
      render(
        <FinishComponent
          theme="light"
          score={500}
          correctAnswersCount={5}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('shows 🏆 for 80%', () => {
      render(
        <FinishComponent
          theme="light"
          score={400}
          correctAnswersCount={4}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('shows 😊 for 60%', () => {
      render(
        <FinishComponent
          theme="light"
          score={300}
          correctAnswersCount={3}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('😊')).toBeInTheDocument();
    });

    it('shows 🤔 for 40%', () => {
      render(
        <FinishComponent
          theme="light"
          score={200}
          correctAnswersCount={2}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('🤔')).toBeInTheDocument();
    });

    it('shows 😢 for 20%', () => {
      render(
        <FinishComponent
          theme="light"
          score={100}
          correctAnswersCount={1}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('😢')).toBeInTheDocument();
    });

    it('shows 😢 for 0%', () => {
      render(
        <FinishComponent
          theme="light"
          score={0}
          correctAnswersCount={0}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('😢')).toBeInTheDocument();
    });
  });

  describe('theme styles', () => {
    it('applies light theme classes to result block', () => {
      render(
        <FinishComponent
          theme="light"
          score={400}
          correctAnswersCount={4}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      const resultDiv = screen.getByText(/Правильных ответов:/).closest('.rounded-lg');
      expect(resultDiv).toHaveClass('bg-gray-100');
    });

    it('applies dark theme classes to result block', () => {
      render(
        <FinishComponent
          theme="dark"
          score={400}
          correctAnswersCount={4}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      const resultDiv = screen.getByText(/Правильных ответов:/).closest('.rounded-lg');
      expect(resultDiv).toHaveClass('bg-gray-700');
    });

    it('applies light theme classes to score', () => {
      render(
        <FinishComponent
          theme="light"
          score={400}
          correctAnswersCount={4}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      const score = screen.getByText('400');
      expect(score).toHaveClass('text-purple-600');
    });

    it('applies dark theme classes to score', () => {
      render(
        <FinishComponent
          theme="dark"
          score={400}
          correctAnswersCount={4}
          questions={mockQuestions}
          resetGame={vi.fn()}
        />
      );

      const score = screen.getByText('400');
      expect(score).toHaveClass('text-purple-400');
    });
  });
});