import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameComponent } from './GameComponent';

// Мокаем MobX store полностью
vi.mock('../../stores/gameStore', () => ({
  gameStore: {
    selectAnswer: vi.fn(),
    setEssayAnswer: vi.fn(),
  }
}));

import { gameStore } from '../../stores/gameStore';

describe('GameComponent', () => {
  const mockQuestion = {
    id: '1',
    question: 'Какой цвет у неба?',
    options: ['Красный', 'Синий', 'Зеленый', 'Желтый'],
    correctAnswer: 1,
    difficulty: 'easy' as const,
    type: 'multiple' as const
  };

  const essayQuestion = {
    id: '2',
    question: 'Напишите эссе',
    options: [],
    correctAnswer: 0,
    difficulty: 'hard' as const,
    type: 'essay' as const
  };

  const mockQuestions = [mockQuestion, { ...mockQuestion, id: '2' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders question text', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('Какой цвет у неба?')).toBeInTheDocument();
    });

    it('renders answer options', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('Красный')).toBeInTheDocument();
      expect(screen.getByText('Синий')).toBeInTheDocument();
      expect(screen.getByText('Зеленый')).toBeInTheDocument();
      expect(screen.getByText('Желтый')).toBeInTheDocument();
    });
  });

  describe('answer selection', () => {
    it('calls selectAnswer when option clicked', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      fireEvent.click(screen.getByText('Синий'));
      expect(gameStore.selectAnswer).toHaveBeenCalledWith(1);
    });

    it('shows checkmark for selected answer', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[1]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      const button = screen.getByText('Синий').closest('button');
      expect(button).toHaveTextContent('✓');
    });
  });

  describe('next button - multiple choice', () => {
    it('shows next button when answer selected', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[1]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('Следующий вопрос')).toBeInTheDocument();
    });

    it('hides next button when no answer selected', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.queryByText('Следующий вопрос')).not.toBeInTheDocument();
    });

    it('calls handleNextQuestion when next button clicked', () => {
      const mockNext = vi.fn();

      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[1]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={mockNext}
          isLastQuestion={false}
        />
      );

      fireEvent.click(screen.getByText('Следующий вопрос'));
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('shows Завершить for last question', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[1]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={true}
        />
      );

      expect(screen.getByText('Завершить')).toBeInTheDocument();
    });
  });

  describe('next button - essay', () => {
    it('shows next button when essay has text', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={[essayQuestion]}
          currentQuestion={essayQuestion}
          selectedAnswers={[]}
          essayAnswer="Some text"
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('Следующий вопрос')).toBeInTheDocument();
    });

    it('hides next button when essay is empty', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={[essayQuestion]}
          currentQuestion={essayQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.queryByText('Следующий вопрос')).not.toBeInTheDocument();
    });
  });

  describe('essay input', () => {
    it('renders textarea for essay question', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={[essayQuestion]}
          currentQuestion={essayQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByPlaceholderText('Введите ваш ответ здесь...')).toBeInTheDocument();
    });

    it('calls setEssayAnswer when typing', () => {
      const mockSetEssay = vi.fn();

      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={[essayQuestion]}
          currentQuestion={essayQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={mockSetEssay}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Введите ваш ответ здесь...'), {
        target: { value: 'Test answer' }
      });
      expect(mockSetEssay).toHaveBeenCalledWith('Test answer');
    });

    it('displays current essay value', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={[essayQuestion]}
          currentQuestion={essayQuestion}
          selectedAnswers={[]}
          essayAnswer="Current text"
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByPlaceholderText('Введите ваш ответ здесь...')).toHaveValue('Current text');
    });
  });

  describe('theme toggle', () => {
    it('calls toggleTheme when theme button clicked', () => {
      const mockToggle = vi.fn();

      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={mockToggle}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      fireEvent.click(screen.getByText('🌙'));
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('shows moon icon for light theme', () => {
      render(
        <GameComponent
          theme="light"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('shows sun icon for dark theme', () => {
      render(
        <GameComponent
          theme="dark"
          score={100}
          currentQuestionIndex={0}
          questions={mockQuestions}
          currentQuestion={mockQuestion}
          selectedAnswers={[]}
          essayAnswer=""
          progress={50}
          gameStore={gameStore}
          toggleTheme={vi.fn()}
          setEssayAnswer={vi.fn()}
          handleNextQuestion={vi.fn()}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });
});