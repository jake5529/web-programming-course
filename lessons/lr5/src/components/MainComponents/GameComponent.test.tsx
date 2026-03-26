import { vi, it, expect, describe, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameComponent } from "./GameComponent";
import { Theme, Question } from "../../types/quiz";
import { gameStore } from '../../stores/gameStore';

// Мокаем gameStore
vi.mock('../../stores/gameStore', () => ({
  gameStore: {
    selectAnswer: vi.fn(),
  }
}));

describe("GameComponent", () => {
  const mockQuestion: Question = {
    id: "1",
    question: "Какой цвет у неба?",
    options: ["Красный", "Синий", "Зеленый", "Желтый"],
    correctAnswer: 1,
    difficulty: "easy",
    type: "multiple"
  };

  const mockQuestions: Question[] = [
    mockQuestion,
    {
      id: "2",
      question: "Сколько планет в солнечной системе?",
      options: ["7", "8", "9", "10"],
      correctAnswer: 1,
      difficulty: "medium",
      type: "multiple"
    }
  ];

  const defaultProps = {
    theme: "light" as Theme,
    score: 100,
    currentQuestionIndex: 0,
    questions: mockQuestions,
    currentQuestion: mockQuestion,
    selectedAnswers: [],
    essayAnswer: "",
    progress: 50,
    gameStore: gameStore,
    toggleTheme: vi.fn(),
    setEssayAnswer: vi.fn(),
    handleNextQuestion: vi.fn(),
    isLastQuestion: false,
  };

  const renderComponent = (props = {}) => {
    return render(<GameComponent {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Рендеринг основных элементов", () => {
    it("должен отображать номер вопроса", () => {
      renderComponent();
      expect(screen.getByText("Вопрос 1 из 2")).toBeInTheDocument();
    });

    it("должен отображать счет", () => {
      renderComponent({ score: 250 });
      expect(screen.getByText("Счёт: 250")).toBeInTheDocument();
    });

    it("должен отображать текст вопроса", () => {
      renderComponent();
      expect(screen.getByText("Какой цвет у неба?")).toBeInTheDocument();
    });

    it("должен отображать все варианты ответов", () => {
      renderComponent();
      expect(screen.getByText("Красный")).toBeInTheDocument();
      expect(screen.getByText("Синий")).toBeInTheDocument();
      expect(screen.getByText("Зеленый")).toBeInTheDocument();
      expect(screen.getByText("Желтый")).toBeInTheDocument();
    });

    it("должен отображать подсказку", () => {
      renderComponent();
      expect(screen.getByText(/MobX \+ Zustand:/)).toBeInTheDocument();
    });
  });

  describe("Сложность вопроса", () => {
    it("должен отображать 'Легкий' для easy difficulty", () => {
      renderComponent();
      expect(screen.getByText("Легкий")).toBeInTheDocument();
    });

    it("должен отображать 'Средний' для medium difficulty", () => {
      const mediumQuestion = { ...mockQuestion, difficulty: "medium" as const };
      renderComponent({ currentQuestion: mediumQuestion });
      expect(screen.getByText("Средний")).toBeInTheDocument();
    });

    it("должен отображать 'Сложный' для hard difficulty", () => {
      const hardQuestion = { ...mockQuestion, difficulty: "hard" as const };
      renderComponent({ currentQuestion: hardQuestion });
      expect(screen.getByText("Сложный")).toBeInTheDocument();
    });
  });

  describe("Выбор ответов", () => {
    it("должен вызывать selectAnswer при клике на вариант ответа", () => {
      renderComponent();
      
      const optionButton = screen.getByText("Синий").closest("button");
      fireEvent.click(optionButton!);
      
      expect(gameStore.selectAnswer).toHaveBeenCalledWith(1);
    });

    it("должен отображать выбранный ответ с правильными классами для светлой темы", () => {
      renderComponent({ theme: "light", selectedAnswers: [1] });
      
      const selectedButton = screen.getByText("Синий").closest("button");
      expect(selectedButton).toHaveClass("border-purple-500", "bg-purple-50");
    });

    it("должен отображать выбранный ответ с правильными классами для темной темы", () => {
      renderComponent({ theme: "dark", selectedAnswers: [1] });
      
      const selectedButton = screen.getByText("Синий").closest("button");
      expect(selectedButton).toHaveClass("border-purple-500", "bg-gray-600");
    });

    it("должен отображать галочку ✓ для выбранного ответа", () => {
      renderComponent({ selectedAnswers: [1] });
      
      const selectedButton = screen.getByText("Синий").closest("button");
      expect(selectedButton).toHaveTextContent("✓");
    });

    it("должен отображать буквы A, B, C, D для невыбранных ответов", () => {
      renderComponent({ selectedAnswers: [] });
      
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
    });
  });

  describe("Текстовый ответ (эссе)", () => {
    const essayQuestion: Question = {
      id: "3",
      question: "Напишите эссе о React",
      options: [],
      correctAnswer: 0,
      difficulty: "hard",
      type: "essay"
    };

    it("должен отображать textarea для вопроса типа essay", () => {
      renderComponent({ 
        currentQuestion: essayQuestion,
        questions: [essayQuestion]
      });
      
      const textarea = screen.getByPlaceholderText("Введите ваш ответ здесь...");
      expect(textarea).toBeInTheDocument();
    });

    it("должен отображать сохраненный текст в textarea", () => {
      renderComponent({ 
        currentQuestion: essayQuestion,
        questions: [essayQuestion],
        essayAnswer: "React это библиотека для создания интерфейсов"
      });
      
      const textarea = screen.getByPlaceholderText("Введите ваш ответ здесь...");
      expect(textarea).toHaveValue("React это библиотека для создания интерфейсов");
    });

    it("должен вызывать setEssayAnswer при вводе текста", () => {
      const setEssayAnswer = vi.fn();
      renderComponent({ 
        currentQuestion: essayQuestion,
        questions: [essayQuestion],
        setEssayAnswer
      });
      
      const textarea = screen.getByPlaceholderText("Введите ваш ответ здесь...");
      fireEvent.change(textarea, { target: { value: "Тестовый ответ" } });
      
      expect(setEssayAnswer).toHaveBeenCalledWith("Тестовый ответ");
    });
  });

  describe("Кнопка 'Далее'", () => {
    it("должна отображаться когда выбран хотя бы один ответ", () => {
      renderComponent({ selectedAnswers: [1] });
      expect(screen.getByText("Следующий вопрос")).toBeInTheDocument();
    });

    it("не должна отображаться когда ни один ответ не выбран", () => {
      renderComponent({ selectedAnswers: [] });
      expect(screen.queryByText("Следующий вопрос")).not.toBeInTheDocument();
    });

    it("должна отображать 'Завершить' для последнего вопроса", () => {
      renderComponent({ 
        selectedAnswers: [1],
        isLastQuestion: true
      });
      
      expect(screen.getByText("Завершить")).toBeInTheDocument();
    });

    it("должна вызывать handleNextQuestion при клике", () => {
      const handleNextQuestion = vi.fn();
      renderComponent({ 
        selectedAnswers: [1],
        handleNextQuestion 
      });
      
      const nextButton = screen.getByText("Следующий вопрос");
      fireEvent.click(nextButton);
      
      expect(handleNextQuestion).toHaveBeenCalledTimes(1);
    });

    it("должна быть доступна для эссе когда есть текст", () => {
      const essayQuestion: Question = {
        id: "3",
        question: "Эссе",
        options: [],
        correctAnswer: 0,
        difficulty: "hard",
        type: "essay"
      };

      renderComponent({ 
        currentQuestion: essayQuestion,
        questions: [essayQuestion],
        essayAnswer: "Текст ответа"
      });
      
      expect(screen.getByText("Следующий вопрос")).toBeInTheDocument();
    });

    it("не должна быть доступна для эссе когда текст пустой", () => {
      const essayQuestion: Question = {
        id: "3",
        question: "Эссе",
        options: [],
        correctAnswer: 0,
        difficulty: "hard",
        type: "essay"
      };

      renderComponent({ 
        currentQuestion: essayQuestion,
        questions: [essayQuestion],
        essayAnswer: ""
      });
      
      expect(screen.queryByText("Следующий вопрос")).not.toBeInTheDocument();
    });
  });

  describe("Прогресс бар", () => {
    it("должен отображать прогресс с правильной шириной", () => {
      renderComponent({ progress: 75 });
      
      const progressBar = document.querySelector(".bg-purple-600.h-2, .bg-purple-500.h-2");
      expect(progressBar).toHaveStyle({ width: "75%" });
    });
  });

  describe("Стили для светлой темы", () => {
    it("должен применять правильные CSS классы", () => {
      renderComponent({ theme: "light" });
      
      // Градиент
      const gradientDiv = screen.getByText("Какой цвет у неба?").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-purple-500", "to-indigo-600");
      
      // Карточка вопроса
      const questionCard = screen.getByText("Какой цвет у неба?").closest(".rounded-2xl");
      expect(questionCard).toHaveClass("bg-white");
      
      // Заголовок вопроса
      const questionTitle = screen.getByText("Какой цвет у неба?");
      expect(questionTitle).toHaveClass("text-gray-800");
      
      // Кнопка темы
      const themeButton = screen.getByText("🌙");
      expect(themeButton).toHaveClass("bg-gray-100", "hover:bg-gray-200");
      
      // Контейнер подсказки
      const hintContainer = screen.getByText(/MobX \+ Zustand:/).closest(".backdrop-blur-sm");
      expect(hintContainer).toHaveClass("bg-white/20");
      
      // Проверяем что текст подсказки отображается
      expect(screen.getByText(/MobX \+ Zustand:/)).toBeInTheDocument();
      expect(screen.getByText(/GameStore управляет игровой логикой/)).toBeInTheDocument();
    });
  });

  describe("Стили для темной темы", () => {
    it("должен применять правильные CSS классы", () => {
      renderComponent({ theme: "dark" });
      
      // Градиент
      const gradientDiv = screen.getByText("Какой цвет у неба?").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-gray-900", "to-black");
      
      // Карточка вопроса
      const questionCard = screen.getByText("Какой цвет у неба?").closest(".rounded-2xl");
      expect(questionCard).toHaveClass("bg-gray-800");
      
      // Заголовок вопроса
      const questionTitle = screen.getByText("Какой цвет у неба?");
      expect(questionTitle).toHaveClass("text-white");
      
      // Кнопка темы
      const themeButton = screen.getByText("☀️");
      expect(themeButton).toHaveClass("bg-gray-700", "hover:bg-gray-600");
      
      // Контейнер подсказки
      const hintContainer = screen.getByText(/MobX \+ Zustand:/).closest(".backdrop-blur-sm");
      expect(hintContainer).toHaveClass("bg-black/20");
      
      // Проверяем что текст подсказки отображается
      expect(screen.getByText(/MobX \+ Zustand:/)).toBeInTheDocument();
      expect(screen.getByText(/GameStore управляет игровой логикой/)).toBeInTheDocument();
    });
  });

  describe("Кнопка переключения темы", () => {
    it("должен отображать 🌙 для светлой темы", () => {
      renderComponent({ theme: "light" });
      expect(screen.getByText("🌙")).toBeInTheDocument();
    });

    it("должен отображать ☀️ для темной темы", () => {
      renderComponent({ theme: "dark" });
      expect(screen.getByText("☀️")).toBeInTheDocument();
    });

    it("должен вызывать toggleTheme при клике", () => {
      const toggleTheme = vi.fn();
      renderComponent({ toggleTheme });
      
      const themeButton = screen.getByText("🌙");
      fireEvent.click(themeButton);
      
      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Transition классы", () => {
    it("должен применять transition-colors duration-300 к основным элементам", () => {
      renderComponent();
      
      const gradientDiv = screen.getByText("Какой цвет у неба?").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("transition-colors", "duration-300");
      
      const headerDiv = screen.getByText("Вопрос 1 из 2").closest(".rounded-lg");
      expect(headerDiv).toHaveClass("transition-colors", "duration-300");
      
      const questionCard = screen.getByText("Какой цвет у неба?").closest(".rounded-2xl");
      expect(questionCard).toHaveClass("transition-colors", "duration-300");
    });
  });
});