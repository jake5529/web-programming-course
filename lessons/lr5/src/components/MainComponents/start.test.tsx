import { vi, it, expect, describe } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartComponent } from "./start";
import { Theme } from "../../types/quiz";

describe("StartComponent", () => {
  const defaultProps = {
    theme: "light" as Theme,
    soundEnabled: true,
    toggleTheme: vi.fn(),
    handleStartGame: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<StartComponent {...defaultProps} {...props} />);
  };

  it("должен отображать заголовок и описание", () => {
    renderComponent();
    
    expect(screen.getByText("Quiz Game")).toBeInTheDocument();
    expect(screen.getByText("MobX + Zustand Edition")).toBeInTheDocument();
  });

  it("должен отображать статус звука", () => {
    renderComponent({ soundEnabled: true });
    const soundParagraph = screen.getByText(/Звук:/);
    expect(soundParagraph).toHaveTextContent("Звук: 🔊");
  });

  it("должен отображать статус звука когда звук выключен", () => {
    renderComponent({ soundEnabled: false });
    const soundParagraph = screen.getByText(/Звук:/);
    expect(soundParagraph).toHaveTextContent("Звук: 🔇");
  });

  it("должен отображать правильную иконку темы для light режима", () => {
    renderComponent({ theme: "light" });
    expect(screen.getByRole("button", { name: "🌙" })).toBeInTheDocument();
  });

  it("должен отображать правильную иконку темы для dark режима", () => {
    renderComponent({ theme: "dark" });
    expect(screen.getByRole("button", { name: "☀️" })).toBeInTheDocument();
  });

  it("должен вызывать toggleTheme при клике на кнопку темы", () => {
    const toggleTheme = vi.fn();
    renderComponent({ toggleTheme, theme: "light" });
    
    fireEvent.click(screen.getByRole("button", { name: "🌙" }));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("должен вызывать handleStartGame при клике на кнопку 'Начать игру'", () => {
    const handleStartGame = vi.fn();
    renderComponent({ handleStartGame });
    
    fireEvent.click(screen.getByText("Начать игру"));
    expect(handleStartGame).toHaveBeenCalledTimes(1);
  });

  describe("Light theme styles", () => {
    it("должен применять правильные CSS классы для светлой темы", () => {
      renderComponent({ theme: "light" });
      
      const gradientDiv = screen.getByText("Quiz Game").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-purple-500", "to-indigo-600");
      
      const cardDiv = screen.getByText("Quiz Game").closest(".rounded-2xl");
      expect(cardDiv).toHaveClass("bg-white");
    });
  });

  describe("Dark theme styles", () => {
    it("должен применять правильные CSS классы для темной темы", () => {
      renderComponent({ theme: "dark" });
      
      const gradientDiv = screen.getByText("Quiz Game").closest(".bg-gradient-to-br");
      expect(gradientDiv).toHaveClass("from-gray-900", "to-black");
      
      const cardDiv = screen.getByText("Quiz Game").closest(".rounded-2xl");
      expect(cardDiv).toHaveClass("bg-gray-800");
    });
  });

  it("должен применять класс transition-colors к основным элементам", () => {
    renderComponent();
    
    const gradientDiv = screen.getByText("Quiz Game").closest(".bg-gradient-to-br");
    expect(gradientDiv).toHaveClass("transition-colors", "duration-300");
    
    const cardDiv = screen.getByText("Quiz Game").closest(".rounded-2xl");
    expect(cardDiv).toHaveClass("transition-colors", "duration-300");
  });

  it("должен применять hover эффект к кнопке начала игры", () => {
    renderComponent();
    expect(screen.getByText("Начать игру")).toHaveClass("hover:scale-105");
  });
});