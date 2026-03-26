import { vi, it, expect, describe } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FinishComponent } from "./FinishScreen";
import { Theme, Question } from "../../types/quiz";

describe("FinishComponent", () => {
  const mockQuestions: Question[] = [
    { 
      id: "1", 
      question: "Вопрос 1", 
      options: ["A", "B", "C", "D"], 
      correctAnswer: 0,
      difficulty: "easy",
      type: "multiple"
    },
    { 
      id: "2", 
      question: "Вопрос 2", 
      options: ["A", "B", "C", "D"], 
      correctAnswer: 1,
      difficulty: "medium",
      type: "multiple"
    },
    { 
      id: "3", 
      question: "Вопрос 3", 
      options: ["A", "B", "C", "D"], 
      correctAnswer: 2,
      difficulty: "hard",
      type: "multiple"
    },
    { 
      id: "4", 
      question: "Вопрос 4", 
      options: ["A", "B", "C", "D"], 
      correctAnswer: 3,
      difficulty: "easy",
      type: "multiple"
    },
    { 
      id: "5", 
      question: "Вопрос 5", 
      options: ["A", "B", "C", "D"], 
      correctAnswer: 0,
      difficulty: "medium",
      type: "multiple"
    },
  ];

  const defaultProps = {
    theme: "light" as Theme,
    score: 400,
    correctAnswersCount: 4,
    questions: mockQuestions,
    resetGame: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<FinishComponent {...defaultProps} {...props} />);
  };

  it("должен отображать заголовок 'Игра завершена!'", () => {
    renderComponent();
    expect(screen.getByText("Игра завершена!")).toBeInTheDocument();
  });

  it("должен отображать количество очков", () => {
    renderComponent({ score: 500 });
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("очков заработано")).toBeInTheDocument();
  });

  it("должен отображать количество правильных ответов", () => {
    renderComponent({ correctAnswersCount: 3, questions: mockQuestions });
    expect(screen.getByText("3 из 5")).toBeInTheDocument();
    expect(screen.getByText("Правильных ответов:")).toBeInTheDocument();
  });

  describe("Расчет процентов и эмодзи", () => {
    it("должен отображать 100% и эмодзи 🏆 когда все ответы правильные", () => {
      renderComponent({ correctAnswersCount: 5, questions: mockQuestions });
      
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("🏆")).toBeInTheDocument();
    });

    it("должен отображать 80% и эмодзи 🏆 когда 4 из 5 правильных", () => {
      renderComponent({ correctAnswersCount: 4, questions: mockQuestions });
      
      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByText("🏆")).toBeInTheDocument();
    });

    it("должен отображать 60% и эмодзи 😊 когда 3 из 5 правильных", () => {
      renderComponent({ correctAnswersCount: 3, questions: mockQuestions });
      
      expect(screen.getByText("60%")).toBeInTheDocument();
      expect(screen.getByText("😊")).toBeInTheDocument();
    });

    it("должен отображать 40% и эмодзи 🤔 когда 2 из 5 правильных", () => {
      renderComponent({ correctAnswersCount: 2, questions: mockQuestions });
      
      expect(screen.getByText("40%")).toBeInTheDocument();
      expect(screen.getByText("🤔")).toBeInTheDocument();
    });

    it("должен отображать 20% и эмодзи 😢 когда 1 из 5 правильных", () => {
      renderComponent({ correctAnswersCount: 1, questions: mockQuestions });
      
      expect(screen.getByText("20%")).toBeInTheDocument();
      expect(screen.getByText("😢")).toBeInTheDocument();
    });

    it("должен отображать 0% и эмодзи 😢 когда 0 правильных ответов", () => {
      renderComponent({ correctAnswersCount: 0, questions: mockQuestions });
      
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("😢")).toBeInTheDocument();
    });

    it("должен отображать 0% и эмодзи 😢 когда нет вопросов", () => {
      renderComponent({ correctAnswersCount: 0, questions: [] });
      
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("😢")).toBeInTheDocument();
    });
  });

  it("должен вызывать resetGame при клике на кнопку 'Играть снова'", () => {
    const resetGame = vi.fn();
    renderComponent({ resetGame });
    
    const resetButton = screen.getByText("Играть снова");
    fireEvent.click(resetButton);
    
    expect(resetGame).toHaveBeenCalledTimes(1);
  });

  describe("Light theme styles", () => {
    it("должен применять правильные CSS классы для светлой темы", () => {
      renderComponent({ theme: "light" });
      
      // Градиент
      const gradientDiv = screen.getByText("Игра завершена!").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-purple-500", "to-indigo-600");
      
      // Карточка
      const cardDiv = screen.getByText("Игра завершена!").closest(".rounded-2xl");
      expect(cardDiv).toHaveClass("bg-white");
      
      // Заголовок
      const title = screen.getByText("Игра завершена!");
      expect(title).toHaveClass("text-gray-800");
      
      // Очки
      const score = screen.getByText("400");
      expect(score).toHaveClass("text-purple-600");
      
      // Блок с результатами
      const resultDiv = screen.getByText(/Правильных ответов:/).closest(".rounded-lg");
      expect(resultDiv).toHaveClass("bg-gray-100");
      
      // Кнопка
      const button = screen.getByText("Играть снова");
      expect(button).toHaveClass("bg-purple-600", "hover:bg-purple-700", "hover:scale-105");
    });
  });

  describe("Dark theme styles", () => {
    it("должен применять правильные CSS классы для темной темы", () => {
      renderComponent({ theme: "dark" });
      
      // Градиент
      const gradientDiv = screen.getByText("Игра завершена!").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-gray-900", "to-black");
      
      // Карточка
      const cardDiv = screen.getByText("Игра завершена!").closest(".rounded-2xl");
      expect(cardDiv).toHaveClass("bg-gray-800");
      
      // Заголовок
      const title = screen.getByText("Игра завершена!");
      expect(title).toHaveClass("text-white");
      
      // Очки
      const score = screen.getByText("400");
      expect(score).toHaveClass("text-purple-400");
      
      // Блок с результатами
      const resultDiv = screen.getByText(/Правильных ответов:/).closest(".rounded-lg");
      expect(resultDiv).toHaveClass("bg-gray-700");
      
      // Кнопка
      const button = screen.getByText("Играть снова");
      expect(button).toHaveClass("bg-purple-700", "hover:bg-purple-800", "hover:scale-105");
    });
  });

  it("должен применять класс transition-colors к основным элементам", () => {
    renderComponent();
    
    const gradientDiv = screen.getByText("Игра завершена!").closest(".bg-gradient-to-br");
    expect(gradientDiv).toHaveClass("transition-colors", "duration-300");
    
    const cardDiv = screen.getByText("Игра завершена!").closest(".rounded-2xl");
    expect(cardDiv).toHaveClass("transition-colors", "duration-300");
  });

  it("должен отображать правильный текст muted в разных темах", () => {
    const { rerender } = renderComponent({ theme: "light" });
    
    let mutedText = screen.getByText("очков заработано");
    expect(mutedText).toHaveClass("text-gray-600");
    
    rerender(<FinishComponent {...defaultProps} theme="dark" />);
    
    mutedText = screen.getByText("очков заработано");
    expect(mutedText).toHaveClass("text-gray-400");
  });
});