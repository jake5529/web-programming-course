import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePostApiSessions } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdAnswers } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import * as React from 'react'
import { StartComponent } from '../components/MainComponents/start';
import { FinishComponent } from '../components/MainComponents/FinishScreen';
import { GameComponent } from '../components/MainComponents/GameComponent';

/**
 * Task 4: Комбинированное использование MobX + Zustand
 */
const Task4 = observer(() => {
  // MobX - бизнес-логика
  const { 
    gameStatus, 
    currentQuestion,
    selectedAnswers, 
    essayAnswer,
    score, 
    progress,
    questions,
    correctAnswersCount,
    currentQuestionIndex,
    isLastQuestion,
    setEssayAnswer, // Добавляем метод для установки текстового ответа
  } = gameStore;

  // Zustand - UI состояние
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 5,
          difficulty: 'medium'
        }
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          // Загружаем вопросы в gameStore
          gameStore.startGame(response.questions);
        },
        onError: (error) => {
          console.error('Failed to create session:', error);
        },
      }
    );
  };

  const handleNextQuestion = () => {
    if (sessionId && currentQuestion) {
      // Определяем тип вопроса и формируем данные для отправки
      let answerData;
      
      if (currentQuestion.type === 'essay') {
        // Для эссе отправляем текстовый ответ
        answerData = {
          questionId: currentQuestion.id as never as string,
          text: essayAnswer || '' // Добавляем проверку на null/undefined
        };
      } else {
        // Для вопросов с выбором отправляем выбранные варианты
        answerData = {
          questionId: currentQuestion.id as never as string,
          selectedOptions: selectedAnswers
        };
      }
  
      // Отправляем ответ на сервер
      submitAnswer.mutate(
        {
          sessionId,
          data: answerData
        },
        {
          onSuccess: (response) => {
            // Обновляем счет на основе ответа сервера
            if ('pointsEarned' in response) {
              // const isCorrect = response.status === 'correct';
              // ... обновляем результат ...
            }
            // Переходим к следующему вопросу
            if (!gameStore.nextQuestion()) {
              handleFinishGame();
            };
          },
          onError: (error) => {
            console.error('Failed to submit answer:', error);
            gameStore.nextQuestion();
          },
        }
      );
    }
  };

  const handleFinishGame = () => {
    if (sessionId) {
      submitSession.mutate(
        { sessionId },
        {
          onSuccess: (response) => {
            console.log('Session completed:', response);
            gameStore.finishGame();
          },
          onError: (error) => {
            console.error('Failed to submit session:', error);
            gameStore.finishGame();
          },
        }
      );
    } else {
      gameStore.finishGame();
    }
  };

    // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <StartComponent
        theme={theme}
        toggleTheme={toggleTheme}
        handleStartGame={handleStartGame}
        soundEnabled = {soundEnabled}
      />
    );
  }

  // Экран результатов
if (gameStatus === 'finished') {
  return (
    <FinishComponent
      theme={theme}
      score={score}
      correctAnswersCount={correctAnswersCount}
      questions={questions}
      resetGame={() => gameStore.resetGame()}
    />
  );
}
  // Игровой экран
  if (!currentQuestion) return null;

  return (
    <GameComponent
      theme={theme}
      score={score}
      toggleTheme={toggleTheme}
      currentQuestionIndex={currentQuestionIndex}
      questions={questions}
      currentQuestion={currentQuestion}
      selectedAnswers={selectedAnswers}
      essayAnswer={essayAnswer || ''}
      progress={progress}
      gameStore={gameStore}
      setEssayAnswer={setEssayAnswer}
      handleNextQuestion={handleNextQuestion}
      isLastQuestion={isLastQuestion}
    />
  );
});

export default Task4;