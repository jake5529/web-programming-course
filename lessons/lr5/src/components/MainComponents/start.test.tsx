import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StartComponent } from './start';

describe('StartComponent', () => {
  it('renders title and description', () => {
    render(
      <StartComponent
        theme="light"
        soundEnabled={true}
        toggleTheme={vi.fn()}
        handleStartGame={vi.fn()}
      />
    );

    expect(screen.getByText('Quiz Game')).toBeInTheDocument();
    expect(screen.getByText('MobX + Zustand Edition')).toBeInTheDocument();
  });

  it('displays sound status when enabled', () => {
    render(
      <StartComponent
        theme="light"
        soundEnabled={true}
        toggleTheme={vi.fn()}
        handleStartGame={vi.fn()}
      />
    );

    expect(screen.getByText(/Звук: 🔊/)).toBeInTheDocument();
  });

  it('displays sound status when disabled', () => {
    render(
      <StartComponent
        theme="light"
        soundEnabled={false}
        toggleTheme={vi.fn()}
        handleStartGame={vi.fn()}
      />
    );

    expect(screen.getByText(/Звук: 🔇/)).toBeInTheDocument();
  });

  it('shows moon icon for light theme', () => {
    render(
      <StartComponent
        theme="light"
        soundEnabled={true}
        toggleTheme={vi.fn()}
        handleStartGame={vi.fn()}
      />
    );

    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('shows sun icon for dark theme', () => {
    render(
      <StartComponent
        theme="dark"
        soundEnabled={true}
        toggleTheme={vi.fn()}
        handleStartGame={vi.fn()}
      />
    );

    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('calls toggleTheme when theme button clicked', () => {
    const mockToggle = vi.fn();

    render(
      <StartComponent
        theme="light"
        soundEnabled={true}
        toggleTheme={mockToggle}
        handleStartGame={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('🌙'));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('calls handleStartGame when start button clicked', () => {
    const mockStart = vi.fn();

    render(
      <StartComponent
        theme="light"
        soundEnabled={true}
        toggleTheme={vi.fn()}
        handleStartGame={mockStart}
      />
    );

    fireEvent.click(screen.getByText('Начать игру'));
    expect(mockStart).toHaveBeenCalledTimes(1);
  });
});